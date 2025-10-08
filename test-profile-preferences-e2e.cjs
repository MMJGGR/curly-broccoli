/**
 * E2E: Profile preferences and insights flow via profile-v2 endpoint
 */

const http = require('http');

function request(method, path, data = null, token = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path,
      method,
      headers: { 'Content-Type': contentType },
      timeout: 10000
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, data: body, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function register() {
  const payload = {
    email: `${Date.now()}@example.com`,
    password: 'pass12345',
    user_type: 'user',
    first_name: 'E2E',
    last_name: 'User',
    dob: '1995-05-05',
    nationalId: 'E2E12345',
    kra_pin: 'A123456789Z',
    annual_income: 480000,
    employment_status: 'Employed',
    dependents: 0,
    goals: { type: 'growth', targetAmount: 100000, timeHorizon: 12 },
    questionnaire: [3,3,3,3,3,3,3,3]
  };
  const res = await request('POST', '/auth/register', payload);
  if (res.status !== 201) throw new Error('register failed');
  return res.data.access_token;
}

async function main() {
  console.log('🔧 E2E: Profile preferences + insights');
  const token = await register();
  console.log('✅ Registered, updating preferences...');

  const prefs = { risk_tolerance: 'moderate', rebalance_frequency: 'annual' };
  const putRes = await request('PUT', '/api/v1/profile-v2/', {
    monthly_income: 50000,
    investment_preferences: prefs
  }, token);
  console.log('PUT /api/v1/profile-v2 ->', putRes.status);

  const me = await request('GET', '/auth/me', null, token);
  console.log('GET /auth/me ->', me.status);
  const ip = me.data?.profile?.investment_preferences;
  if (!ip) throw new Error('preferences not saved');
  console.log('✅ Preferences saved');

  const v2 = await request('GET', '/api/v1/profile-v2/', null, token);
  const planning = v2.data?.financial_planning || {};
  if (planning.age_category && planning.emergency_fund_target !== undefined) {
    console.log('✅ Insights present');
  } else {
    console.log('ℹ️ Insights partial');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

