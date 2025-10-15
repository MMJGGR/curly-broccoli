/**
 * Reset current user's financial data (assets, liabilities, expenses, goals, accounts, transactions, budget categories)
 * Usage:
 *   node seed/reset-user-data.cjs --email EMAIL --password PASS
 */
const http = require('http');

function arg(name, fallback=null){const i=process.argv.indexOf(name);return (i>=0&&i+1<process.argv.length)?process.argv[i+1]:fallback;}
const EMAIL = arg('--email');
const PASSWORD = arg('--password');
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = parseInt(process.env.API_PORT || '8000', 10);

if (!EMAIL || !PASSWORD) { console.error('Missing --email/--password'); process.exit(1); }

function req(method, p, headers={}, body=null){return new Promise((res,rej)=>{const o={hostname:API_HOST,port:API_PORT,path:p,method,headers,timeout:15000};const r=http.request(o,(s)=>{let d='';s.on('data',c=>d+=c);s.on('end',()=>{let j=null;try{j=JSON.parse(d);}catch{}res({status:s.statusCode,data:j??d});});});r.on('error',rej);r.on('timeout',()=>r.destroy(new Error('timeout')));if(body)r.write(body);r.end();});}

async function login(){const form=`username=${encodeURIComponent(EMAIL)}&password=${encodeURIComponent(PASSWORD)}`;const r=await req('POST','/auth/login',{'Content-Type':'application/x-www-form-urlencoded'},form);if(r.status===200&&r.data&&r.data.access_token)return r.data.access_token;throw new Error(`login failed: ${r.status}`)}

async function wipeList(token, listPath, idKey='id', deletePath=(id)=>`${listPath}${id}`){
  const h={'Authorization':`Bearer ${token}`};
  const r=await req('GET', listPath, h);
  const items = Array.isArray(r.data?.[idKey==="id"?undefined:'items']) ? r.data.items : (Array.isArray(r.data) ? r.data : r.data?.[listPath.split('/').slice(-2,-1)[0]] || []);
  const arr = Array.isArray(items) ? items : [];
  for (const it of arr){ const id = it[idKey] || it.id; if(!id) continue; try{ const del = await req('DELETE', deletePath(id), h); console.log('DEL', listPath, id, del.status);}catch(e){ console.warn('Failed delete', listPath, id);}}
}

async function run(){
  const token = await login();
  console.log('Resetting user data...');
  const h={'Authorization':`Bearer ${token}`};
  // Budget categories
  try{
    const cats = await req('GET','/api/v1/budget-v2/categories', h);
    for (const c of (cats.data?.categories||[])){
      await req('DELETE', `/api/v1/budget-v2/categories/${encodeURIComponent(c.name)}`, h);
      console.log('DEL budget cat', c.name);
    }
  }catch{}
  // Expenses
  await wipeList(token, '/api/v1/expenses-v2/', 'id', (id)=>`/api/v1/expenses-v2/${id}`);
  // Goals
  await wipeList(token, '/api/v1/goals-v2/', 'id', (id)=>`/api/v1/goals-v2/${id}`);
  // Transactions
  await wipeList(token, '/api/v1/transactions-v2/', 'id', (id)=>`/api/v1/transactions-v2/${id}`);
  // Accounts
  await wipeList(token, '/api/v1/accounts-v2/', 'id', (id)=>`/api/v1/accounts-v2/${id}`);
  // Assets/Liabilities
  await wipeList(token, '/api/v1/assets-v2/', 'id', (id)=>`/api/v1/assets-v2/${id}`);
  await wipeList(token, '/api/v1/liabilities-v2/', 'id', (id)=>`/api/v1/liabilities-v2/${id}`);
  console.log('✅ Reset complete');
}

run().catch(e=>{console.error('❌ Reset failed', e); process.exit(1);});

