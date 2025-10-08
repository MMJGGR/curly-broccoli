/**
 * Test the CORRECT endpoints that include onboarding conversion
 */

const http = require('http');

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function loginUser(email, password) {
  const formData = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  
  const response = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(formData);
    req.end();
  });
  
  if (response.status === 200 && response.data.access_token) {
    return response.data.access_token;
  }
  return null;
}

async function testCorrectEndpoints(email, password, name) {
  console.log(`\n🚀 TESTING CORRECT ENDPOINTS FOR ${name.toUpperCase()}`);
  console.log('='.repeat(60));
  
  const token = await loginUser(email, password);
  if (!token) {
    console.log('❌ Login failed');
    return;
  }
  
  console.log('✅ Login successful');
  
  // Test the CORRECT endpoints that have onboarding integration
  const correctEndpoints = [
    { name: 'Income (Overview)', path: '/api/v1/income-v2/overview', hasOnboarding: true },
    { name: 'Income (Sources)', path: '/api/v1/income-v2/sources', hasOnboarding: true },
    { name: 'Goals (Overview)', path: '/api/v1/goals-v2/overview', hasOnboarding: true },
    { name: 'Expenses (Overview)', path: '/api/v1/expenses-v2/overview', hasOnboarding: true },
    { name: 'Goals (Root)', path: '/api/v1/goals-v2/', hasOnboarding: false },
    { name: 'Expenses (Root)', path: '/api/v1/expenses-v2/', hasOnboarding: false }
  ];
  
  for (const endpoint of correctEndpoints) {
    try {
      console.log(`\n📊 Testing ${endpoint.name} (${endpoint.hasOnboarding ? 'WITH' : 'WITHOUT'} onboarding)...`);
      const response = await makeRequest('GET', endpoint.path, null, token);
      
      if (response.status === 200) {
        const data = response.data;
        console.log('✅ SUCCESS!');
        
        // Count items based on response structure
        let count = 0;
        if (data.income_sources) count = data.income_sources.length;
        if (data.goals) count = data.goals.length;
        if (data.expenses) count = data.expenses.length;
        if (Array.isArray(data)) count = data.length;
        
        console.log(`   📊 Items found: ${count}`);
        
        // Show data sources if available
        if (data.data_sources) {
          console.log(`   🔄 Data sources:`, data.data_sources);
        }
        
        // Show sample items
        const items = data.income_sources || data.goals || data.expenses || data;
        if (items && items.length > 0) {
          console.log(`   📝 Sample item: ${items[0].name || items[0].source_name} (${items[0].monthly_amount || items[0].target_amount})`);
          if (items[0].source) console.log(`   📋 Source: ${items[0].source}`);
        }
        
      } else {
        console.log(`❌ FAILED - HTTP ${response.status}`);
        console.log(`   Error: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔧 TESTING CORRECT ONBOARDING-INTEGRATED ENDPOINTS');
  console.log('='.repeat(70));
  console.log('Issue identified: We were calling the wrong endpoints!');
  console.log('✅ /overview endpoints HAVE onboarding integration');
  console.log('❌ / (root) endpoints do NOT have onboarding integration');
  
  await testCorrectEndpoints('richard.mmacharia@gmail.com', 'jaggerthee', 'Richard');
  await testCorrectEndpoints('jamal@example.com', 'jamal12345', 'Jamal');
  
  console.log('\n🎯 SUMMARY');
  console.log('='.repeat(70));
  console.log('💡 The issue was we were calling the wrong endpoints!');
  console.log('✅ Income /overview and /sources = HAVE onboarding data');
  console.log('✅ Goals /overview = HAS onboarding data');
  console.log('❌ Goals / (root) = NO onboarding data');
  console.log('❌ Expenses / (root) = NO onboarding data (needs implementation)');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Update UnifiedFinancialContext to call /overview endpoints');
  console.log('2. Implement expenses onboarding integration');
  console.log('3. Test the corrected frontend integration');
}

main().catch(console.error);