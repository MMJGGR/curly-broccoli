/**
 * Seed from directory of JSON files that mimic FE input shapes.
 * Usage:
 *   node seed/seed-from-json.cjs --email EMAIL --password PASS --dir seed/richard
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

function arg(name, fallback = null) { const i = process.argv.indexOf(name); return i>=0 && i+1<process.argv.length ? process.argv[i+1] : fallback; }
const EMAIL = arg('--email');
const PASSWORD = arg('--password');
const DIR = arg('--dir', 'seed/richard');
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = parseInt(process.env.API_PORT || '8000', 10);

if (!EMAIL || !PASSWORD) { console.error('Missing --email/--password'); process.exit(1); }

function httpRequest(method, p, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: API_HOST, port: API_PORT, path: p, method, headers, timeout: 20000 };
    const req = http.request(opts, (res) => { let data=''; res.on('data', c=>data+=c); res.on('end', ()=>{ let json=null; try{ json=JSON.parse(data);}catch{} resolve({status:res.statusCode, data:json??data}); }); });
    req.on('error', reject); req.on('timeout', ()=>req.destroy(new Error('timeout')));
    if (body) req.write(body);
    req.end();
  });
}

async function login(email, password) {
  const form = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  const res = await httpRequest('POST', '/auth/login', {'Content-Type':'application/x-www-form-urlencoded'}, form);
  if (res.status===200 && res.data && res.data.access_token) return res.data.access_token;
  throw new Error(`login failed: ${res.status}`);
}

async function seedAssets(token, file) {
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const a of arr) {
    const res = await httpRequest('POST', '/api/v1/assets-v2/', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify(a));
    console.log('assets:', res.status, a.name);
  }
}

async function seedLiabilities(token, file) {
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const l of arr) {
    const res = await httpRequest('POST', '/api/v1/liabilities-v2/', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify(l));
    console.log('liabilities:', res.status, l.name);
  }
}

async function seedIncome(token, file) {
  const data = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const src of data.sources || []) {
    const payload = { source_name: src.source_name, monthly_amount: src.monthly_amount, frequency: src.frequency || 'monthly', source_type: src.source_type || 'salary' };
    const res = await httpRequest('POST', '/api/v1/income-v2/sources', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify(payload));
    console.log('income source:', res.status, src.source_name);
    // post history
    if (res.status===201 || res.status===200) {
      const created = res.data && res.data.income_source; const id = created && (created.id || created.source_id || created.income_source_id);
      if (id && Array.isArray(src.history)) {
        for (const h of src.history) {
          const hres = await httpRequest('POST', `/api/v1/income-v2/sources/${id}/history`, { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify({ effective_date: h.effective_date, amount: h.amount, frequency: h.frequency || 'monthly' }));
          console.log(' income history:', hres.status, h.effective_date);
        }
      }
    }
  }
}

async function seedExpenses(token, file) {
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const e of arr) {
    const res = await httpRequest('POST', '/api/v1/expenses-v2/', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify(e));
    console.log('expense:', res.status, e.description);
  }
}

async function seedGoals(token, file) {
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const g of arr) {
    const res = await httpRequest('POST', '/api/v1/goals-v2/', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify(g));
    console.log('goal:', res.status, g.name);
  }
}

async function seedBudgetCategories(token, file) {
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const c of arr) {
    const res = await httpRequest('POST', `/api/v1/budget-v2/categories?category_name=${encodeURIComponent(c.name)}&allocated_amount=${encodeURIComponent(c.allocated_amount)}&category_type=${encodeURIComponent(c.category_type||'expense')}`, { 'Authorization': `Bearer ${token}` });
    console.log('budget cat:', res.status, c.name);
  }
}

async function seedTransactions(token, file) {
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const t of arr) {
    const res = await httpRequest('POST', '/api/v1/transactions-v2/', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify(t));
    console.log('txn:', res.status, t.description);
  }
}

async function run() {
  console.log('🔐 Logging in...');
  const token = await login(EMAIL, PASSWORD);
  console.log('✅ Logged in');

  const files = (p) => path.resolve(DIR, p);
  if (fs.existsSync(files('assets.json'))) await seedAssets(token, files('assets.json'));
  if (fs.existsSync(files('liabilities.json'))) await seedLiabilities(token, files('liabilities.json'));
  if (fs.existsSync(files('income.json'))) await seedIncome(token, files('income.json'));
  if (fs.existsSync(files('expenses.json'))) await seedExpenses(token, files('expenses.json'));
  if (fs.existsSync(files('goals.json'))) await seedGoals(token, files('goals.json'));
  if (fs.existsSync(files('budget.categories.json'))) await seedBudgetCategories(token, files('budget.categories.json'));
  if (fs.existsSync(files('transactions.json'))) await seedTransactions(token, files('transactions.json'));

  console.log('🎉 Seed complete. Open the app and verify tabs.');
}

run().catch(e=>{ console.error('❌ Seed failed', e); process.exit(1); });

