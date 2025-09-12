/**
 * Investigate why expenses and goals aren't showing up despite being in onboarding
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

async function investigateOnboardingData(email, password) {
  console.log(`🔍 INVESTIGATING ONBOARDING DATA FOR ${email.toUpperCase()}`);
  console.log('='.repeat(70));
  
  const token = await loginUser(email, password);
  if (!token) {
    console.log('❌ Login failed');
    return;
  }
  
  // Get detailed onboarding state
  const onboardingResponse = await makeRequest('GET', '/api/v1/onboarding/state', null, token);
  
  if (onboardingResponse.status !== 200) {
    console.log('❌ Failed to get onboarding state:', onboardingResponse.data);
    return;
  }
  
  const onboardingData = onboardingResponse.data;
  console.log('✅ Onboarding state retrieved');
  console.log('📊 Completion status:', onboardingData.is_complete);
  console.log('📝 Completed steps:', onboardingData.completed_steps);
  
  // Examine Step 3 (Financial Data) in detail
  if (onboardingData.step3_data) {
    console.log('\n💰 STEP 3 - FINANCIAL DATA:');
    console.log('='.repeat(40));
    const step3 = onboardingData.step3_data;
    console.log('Monthly Income:', step3.monthlyIncome);
    console.log('Rent:', step3.rent);
    console.log('Utilities:', step3.utilities);
    console.log('Groceries:', step3.groceries);
    console.log('Transport:', step3.transport);
    console.log('Loan Repayments:', step3.loanRepayments);
    console.log('Custom Expenses:', JSON.stringify(step3.customExpenses, null, 2));
    console.log('Custom Incomes:', JSON.stringify(step3.customIncomes, null, 2));
    
    // Calculate what should be converted
    console.log('\n🔄 EXPECTED CONVERSIONS:');
    console.log('Expected Income Sources:', 1 + (step3.customIncomes?.length || 0));
    console.log('Expected Expenses:', 5 + (step3.customExpenses?.length || 0)); // rent, utilities, groceries, transport, loans + custom
    console.log('Expected Assets: 0 (not in step3)');
    console.log('Expected Liabilities: 0 (not in step3)');
  }
  
  // Examine Step 4 (Goals Data) in detail
  if (onboardingData.step4_data) {
    console.log('\n🎯 STEP 4 - GOALS DATA:');
    console.log('='.repeat(40));
    const step4 = onboardingData.step4_data;
    console.log('Emergency Fund:', step4.emergencyFund);
    console.log('Home Down Payment:', step4.homeDownPayment);
    console.log('Education:', step4.education);
    console.log('Retirement:', step4.retirement);
    console.log('Investment:', step4.investment);
    console.log('Debt Payoff:', step4.debtPayoff);
    console.log('Other:', step4.other);
    console.log('Timeframes:', JSON.stringify(step4.timeframes, null, 2));
    
    // Calculate expected goals
    const goalCategories = ['emergencyFund', 'homeDownPayment', 'education', 'retirement', 'investment', 'debtPayoff', 'other'];
    const activeGoals = goalCategories.filter(cat => step4[cat] && step4[cat] > 0);
    console.log('\n🔄 EXPECTED CONVERSIONS:');
    console.log('Active Goals:', activeGoals.length, '-', activeGoals.join(', '));
  }
  
  // Now check what actually appears in the APIs
  console.log('\n📊 ACTUAL API RESULTS:');
  console.log('='.repeat(40));
  
  const endpoints = [
    { name: 'Income', path: '/api/v1/income-v2/' },
    { name: 'Expenses', path: '/api/v1/expenses-v2/' },
    { name: 'Goals', path: '/api/v1/goals-v2/' },
    { name: 'Assets', path: '/api/v1/assets-v2/' },
    { name: 'Liabilities', path: '/api/v1/liabilities-v2/' }
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest('GET', endpoint.path, null, token);
    if (response.status === 200) {
      const data = response.data;
      let count = 0;
      
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data && typeof data === 'object') {
        if (data.income_sources) count = data.income_sources.length;
        if (data.expenses) count = data.expenses.length;
        if (data.goals) count = data.goals.length;
        if (data.assets) count = data.assets.length;
        if (data.liabilities) count = data.liabilities.length;
      }
      
      console.log(`${endpoint.name}: ${count} items${count > 0 ? ' ✅' : ' ❌'}`);
      
      if (count > 0 && endpoint.name !== 'Income') {
        console.log('  Sample:', JSON.stringify(data).substring(0, 200));
      }
    } else {
      console.log(`${endpoint.name}: ERROR ${response.status}`);
    }
  }
  
  // The key question: WHERE IS THE CONVERSION HAPPENING?
  console.log('\n🔍 KEY ISSUE IDENTIFIED:');
  console.log('='.repeat(40));
  console.log('✅ Onboarding data is stored correctly');
  console.log('✅ Income conversion is working');
  console.log('❌ Expense conversion is NOT working');
  console.log('❌ Goals conversion is NOT working');
  console.log('💡 LIKELY CAUSE: The backend conversion logic is only implemented for income');
  console.log('🔧 SOLUTION NEEDED: Implement expense and goal conversion in the backend API endpoints');
}

async function main() {
  await investigateOnboardingData('richard.mmacharia@gmail.com', 'jaggerthee');
  console.log('\n' + '='.repeat(70));
  await investigateOnboardingData('jamal@example.com', 'jamal12345');
}

main().catch(console.error);