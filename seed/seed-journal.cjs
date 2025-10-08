/**
 * Seed historical journal entries for a user using /api/v1/ledger endpoints.
 * Usage:
 *   node seed/seed-journal.cjs --email you@example.com --password secret --file seed/journal.sample.json
 * Defaults:
 *   --file defaults to seed/journal.sample.json
 *
 * Notes:
 *  - Seeds chart of accounts if not present via POST /api/v1/ledger/seed-coa
 *  - Posts each journal entry with the given timestamp, description, lines, meta
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return fallback;
}

const EMAIL = arg('--email', process.env.SEED_EMAIL || 'richard.mmacharia@gmail.com');
const PASSWORD = arg('--password', process.env.SEED_PASSWORD || 'jaggerthee');
const FILE = arg('--file', path.join(process.cwd(), 'seed/journal.sample.json'));
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = parseInt(process.env.API_PORT || '8000', 10);

function httpRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: API_HOST, port: API_PORT, path, method, headers, timeout: 15000 };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, data: json ?? data, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

async function login(email, password) {
  const form = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  const res = await httpRequest('POST', '/auth/login', { 'Content-Type': 'application/x-www-form-urlencoded' }, form);
  if (res.status === 200 && res.data && res.data.access_token) return res.data.access_token;
  throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.data)}`);
}

async function seedCOA(token) {
  const res = await httpRequest('POST', '/api/v1/ledger/seed-coa', { Authorization: `Bearer ${token}` });
  if (res.status !== 200) throw new Error(`seed-coa failed: ${res.status}`);
  return res.data;
}

async function postJournal(token, entry) {
  const payload = JSON.stringify(entry);
  const res = await httpRequest('POST', '/api/v1/ledger/journal', { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, payload);
  if (res.status !== 200) throw new Error(`journal post failed: ${res.status} ${JSON.stringify(res.data)}`);
  return res.data;
}

async function run() {
  console.log('🔐 Logging in...');
  const token = await login(EMAIL, PASSWORD);
  console.log('✅ Logged in');

  console.log('📚 Seeding Chart of Accounts (if needed)...');
  await seedCOA(token);
  console.log('✅ COA ready');

  const filePath = path.resolve(FILE);
  if (!fs.existsSync(filePath)) throw new Error(`Seed file not found: ${filePath}`);
  const entries = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(entries)) throw new Error('Seed file must be a JSON array');

  let ok = 0;
  for (const e of entries) {
    try {
      await postJournal(token, e);
      ok += 1;
      console.log(`   • Posted: ${e.description} @ ${e.timestamp}`);
    } catch (err) {
      console.warn(`   ✖ Failed: ${e.description} @ ${e.timestamp} — ${err.message}`);
    }
  }
  console.log(`\n✅ Finished. Posted ${ok}/${entries.length} journal entries.`);
  console.log('Open the app and check: Dashboard → Journal; Balance Sheet → Reconciliation & Journal; Cash Flow → Journal');
}

run().catch((e) => { console.error('❌ Seed failed', e); process.exit(1); });

