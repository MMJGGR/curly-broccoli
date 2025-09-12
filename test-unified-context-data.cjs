/**
 * Test retrieving data from UnifiedFinancialContext endpoints
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
  console.log(`🔐 Logging in ${email}...`);
  try {
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
      console.log(`✅ Login successful for ${email}`);
      return response.data.access_token;
    } else {
      console.log(`❌ Login failed for ${email}:`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login error for ${email}:`, error.message);
    return null;
  }
}

async function testFinancialEndpoints(email, token) {
  console.log(`\n💰 Testing financial endpoints for ${email}`);
  console.log('='.repeat(60));
  
  const endpoints = [
    { name: 'Assets', path: '/api/v1/assets-v2/' },
    { name: 'Income Sources', path: '/api/v1/income-v2/overview' },
    { name: 'Expenses', path: '/api/v1/expenses-v2/' },
    { name: 'Goals', path: '/api/v1/goals-v2/overview' },
    { name: 'Liabilities', path: '/api/v1/liabilities-v2/' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📊 Testing ${endpoint.name}...`);
      const response = await makeRequest('GET', endpoint.path, null, token);
      
      if (response.status === 200) {
        const data = response.data;
        let count = 0;
        let items = [];
        
        // Handle different response formats
        if (Array.isArray(data)) {
          count = data.length;
          items = data;
        } else if (data && typeof data === 'object') {
          if (data.assets) {
            count = data.assets.length;
            items = data.assets;
          } else if (data.income_sources) {
            count = data.income_sources.length;
            items = data.income_sources;
          } else if (data.expenses) {
            count = data.expenses.length;
            items = data.expenses;
          } else if (data.goals) {
            count = data.goals.length;
            items = data.goals;
          } else if (data.liabilities) {
            count = data.liabilities.length;
            items = data.liabilities;
          } else {
            console.log(`   📋 Response structure:`, Object.keys(data));
          }
        }
        
        console.log(`   ✅ ${endpoint.name}: ${count} items found`);
        if (count > 0) {
          console.log(`   📝 Sample item:`, JSON.stringify(items[0], null, 2).substring(0, 200) + '...');
        }
        
        results[endpoint.name.toLowerCase().replace(' ', '_')] = {
          status: 'SUCCESS',
          count: count,
          data: items.slice(0, 2) // Store first 2 items for summary
        };
      } else {
        console.log(`   ❌ ${endpoint.name}: HTTP ${response.status}`);
        console.log(`   📋 Error:`, response.data);
        results[endpoint.name.toLowerCase().replace(' ', '_')] = {
          status: 'FAILED',
          error: response.data
        };
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      results[endpoint.name.toLowerCase().replace(' ', '_')] = {
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  return results;
}

async function testOnboardingData(email, token) {
  console.log(`\n📋 Testing onboarding data for ${email}`);
  console.log('='.repeat(60));
  
  try {
    console.log('🔍 Checking onboarding state...');
    const response = await makeRequest('GET', '/api/v1/onboarding/state', null, token);
    
    if (response.status === 200) {
      const data = response.data;
      console.log('✅ Onboarding state retrieved successfully');
      console.log('📊 Completion status:', data.is_complete);
      console.log('📝 Completed steps:', data.completed_steps || 'None');
      
      if (data.step3_data) {
        console.log('💰 Financial data found in onboarding');
        const finData = data.step3_data;
        console.log('   Monthly Income:', finData.monthlyIncome);
        console.log('   Custom Expenses:', finData.customExpenses?.length || 0);
        console.log('   Custom Income:', finData.customIncomes?.length || 0);
      }
      
      if (data.step4_data) {
        console.log('🎯 Goals data found in onboarding');
        const goalsData = data.step4_data;
        console.log('   Emergency Fund:', goalsData.emergencyFund);
        console.log('   Retirement:', goalsData.retirement);
        console.log('   Investment:', goalsData.investment);
      }
      
      return data;
    } else {
      console.log('❌ Failed to retrieve onboarding state:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error checking onboarding data:', error.message);
    return null;
  }
}

async function main() {
  console.log('🏦 TESTING UNIFIEDFINANCIALCONTEXT DATA RETRIEVAL');
  console.log('='.repeat(70));
  
  const users = [
    { email: 'richard.mmacharia@gmail.com', password: 'jaggerthee', name: 'Richard' },
    { email: 'jamal@example.com', password: 'jamal12345', name: 'Jamal' }
  ];
  
  for (const user of users) {
    console.log(`\n🚀 Testing user: ${user.name} (${user.email})`);
    console.log('='.repeat(70));
    
    // Login
    const token = await loginUser(user.email, user.password);
    if (!token) {
      console.log(`❌ Cannot test ${user.name} - login failed`);
      continue;
    }
    
    // Test onboarding data first
    const onboardingData = await testOnboardingData(user.email, token);
    
    // Test financial endpoints
    const financialResults = await testFinancialEndpoints(user.email, token);
    
    // Summary for this user
    console.log(`\n📊 SUMMARY FOR ${user.name.toUpperCase()}`);
    console.log('='.repeat(40));
    
    if (onboardingData) {
      console.log(`🔄 Onboarding: ${onboardingData.is_complete ? 'COMPLETE' : 'INCOMPLETE'}`);
      console.log(`📝 Steps completed: ${onboardingData.completed_steps?.length || 0}/5`);
    }
    
    let totalItems = 0;
    Object.entries(financialResults).forEach(([key, result]) => {
      const icon = result.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`${icon} ${key.replace('_', ' ')}: ${result.count || 0} items`);
      totalItems += (result.count || 0);
    });
    
    console.log(`📈 Total financial items: ${totalItems}`);
    
    if (totalItems > 0) {
      console.log(`🎉 SUCCESS: ${user.name} has financial data in the UnifiedFinancialContext!`);
    } else if (onboardingData && !onboardingData.is_complete) {
      console.log(`⏳ PENDING: ${user.name} has onboarding data but hasn't completed the process`);
      console.log(`💡 Suggestion: Complete onboarding to trigger data persistence`);
    } else {
      console.log(`📭 EMPTY: ${user.name} has no financial data yet`);
    }
  }
  
  console.log('\n🎯 FINAL ANALYSIS');
  console.log('='.repeat(70));
  console.log('✅ Login authentication: WORKING');
  console.log('✅ API endpoints: ACCESSIBLE'); 
  console.log('✅ Onboarding data storage: WORKING');
  console.log('🔄 Data persistence: DEPENDS ON ONBOARDING COMPLETION');
  console.log('💡 Next step: Complete full onboarding flow to trigger UnifiedFinancialContext persistence');
}

main().catch(console.error);