/**
 * Create comprehensive financial data for Richard and Jamal users
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
  console.log(`🔐 Logging in user: ${email}`);
  try {
    // OAuth2PasswordRequestForm expects form-encoded data, not JSON
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

async function createAsset(token, assetData) {
  try {
    const response = await makeRequest('POST', '/api/v1/assets-v2/', assetData, token);
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Asset "${assetData.name}" created successfully`);
      return response.data;
    } else {
      console.log(`❌ Failed to create asset "${assetData.name}":`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating asset "${assetData.name}":`, error.message);
    return null;
  }
}

async function createIncome(token, incomeData) {
  try {
    const response = await makeRequest('POST', '/api/v1/income-v2/sources', incomeData, token);
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Income "${incomeData.source}" created successfully`);
      return response.data;
    } else {
      console.log(`❌ Failed to create income "${incomeData.source}":`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating income "${incomeData.source}":`, error.message);
    return null;
  }
}

async function createExpense(token, expenseData) {
  try {
    const response = await makeRequest('POST', '/api/v1/expenses-v2/', expenseData, token);
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Expense "${expenseData.category}" created successfully`);
      return response.data;
    } else {
      console.log(`❌ Failed to create expense "${expenseData.category}":`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating expense "${expenseData.category}":`, error.message);
    return null;
  }
}

async function createGoal(token, goalData) {
  try {
    const response = await makeRequest('POST', '/api/v1/goals-v2/', goalData, token);
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Goal "${goalData.name}" created successfully`);
      return response.data;
    } else {
      console.log(`❌ Failed to create goal "${goalData.name}":`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating goal "${goalData.name}":`, error.message);
    return null;
  }
}

async function createLiability(token, liabilityData) {
  try {
    const response = await makeRequest('POST', '/api/v1/liabilities-v2/', liabilityData, token);
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Liability "${liabilityData.name}" created successfully`);
      return response.data;
    } else {
      console.log(`❌ Failed to create liability "${liabilityData.name}":`, response.data);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating liability "${liabilityData.name}":`, error.message);
    return null;
  }
}

const richardData = {
  assets: [
    {
      name: "Primary Residence",
      asset_type: "real_estate_residential",
      current_value: 450000,
      acquisition_cost: 420000,
      acquisition_date: "2020-01-01T00:00:00Z",
      description: "Family home in Portland"
    },
    {
      name: "401k Account",
      asset_type: "retirement_401k",
      current_value: 125000,
      acquisition_cost: 85000,
      acquisition_date: "2018-01-01T00:00:00Z",
      description: "Company sponsored retirement plan"
    },
    {
      name: "Emergency Fund",
      asset_type: "cash_savings",
      current_value: 25000,
      acquisition_cost: 25000,
      acquisition_date: "2022-01-01T00:00:00Z",
      description: "High-yield savings for emergencies"
    }
  ],
  income: [
    {
      source_name: "Software Engineer Salary",
      amount: 95000,
      frequency: "annual",
      income_type: "employment",
      description: "Full-time software engineer position"
    },
    {
      source_name: "Freelance Consulting",
      amount: 2000,
      frequency: "monthly", 
      income_type: "freelance",
      description: "Part-time consulting work"
    }
  ],
  expenses: [
    {
      category: "Housing",
      amount: 2800,
      frequency: "monthly",
      expense_type: "fixed",
      description: "Monthly mortgage payment"
    },
    {
      category: "Food & Groceries",
      amount: 800,
      frequency: "monthly",
      expense_type: "variable",
      description: "Food and grocery expenses"
    },
    {
      category: "Transportation",
      amount: 600,
      frequency: "monthly",
      expense_type: "variable",
      description: "Car payment and gas"
    }
  ],
  goals: [
    {
      goal_name: "Retirement Savings",
      goal_type: "retirement",
      target_amount: 1000000,
      current_amount: 125000,
      target_date: "2045-01-01T00:00:00Z",
      priority_level: "high",
      description: "Long-term retirement planning"
    },
    {
      goal_name: "Home Renovation",
      goal_type: "home_improvement",
      target_amount: 50000,
      current_amount: 5000,
      target_date: "2025-06-01T00:00:00Z",
      priority_level: "medium",
      description: "Kitchen and bathroom renovation"
    }
  ],
  liabilities: [
    {
      liability_name: "Mortgage",
      liability_type: "mortgage",
      principal_balance: 320000,
      interest_rate: 3.25,
      monthly_payment: 2200,
      maturity_date: "2050-01-01T00:00:00Z"
    },
    {
      liability_name: "Car Loan",
      liability_type: "auto_loan",
      principal_balance: 18000,
      interest_rate: 4.5,
      monthly_payment: 450,
      maturity_date: "2026-12-01T00:00:00Z"
    }
  ]
};

const jamalData = {
  assets: [
    {
      name: "Investment Portfolio",
      asset_type: "investment_brokerage",
      current_value: 85000,
      acquisition_cost: 70000,
      acquisition_date: "2021-01-01T00:00:00Z",
      description: "Mixed stock and bond portfolio"
    },
    {
      name: "Checking Account",
      asset_type: "cash_checking",
      current_value: 12000,
      acquisition_cost: 12000,
      acquisition_date: "2020-01-01T00:00:00Z",
      description: "Primary bank account"
    },
    {
      name: "Crypto Holdings",
      asset_type: "investment_cryptocurrency",
      current_value: 8000,
      acquisition_cost: 10000,
      acquisition_date: "2022-01-01T00:00:00Z",
      description: "Bitcoin and Ethereum"
    }
  ],
  income: [
    {
      source_name: "Marketing Manager Salary",
      amount: 78000,
      frequency: "annual",
      income_type: "employment",
      description: "Full-time marketing manager position"
    },
    {
      source_name: "Investment Dividends",
      amount: 300,
      frequency: "monthly",
      income_type: "investment",
      description: "Monthly dividend income"
    }
  ],
  expenses: [
    {
      category: "Rent",
      amount: 1800,
      frequency: "monthly",
      expense_type: "fixed",
      description: "Monthly apartment rent"
    },
    {
      category: "Food & Dining",
      amount: 600,
      frequency: "monthly",
      expense_type: "variable",
      description: "Food and dining expenses"
    },
    {
      category: "Entertainment",
      amount: 400,
      frequency: "monthly",
      expense_type: "variable",
      description: "Entertainment and leisure"
    }
  ],
  goals: [
    {
      goal_name: "House Down Payment",
      goal_type: "home_purchase",
      target_amount: 80000,
      current_amount: 15000,
      target_date: "2026-12-01T00:00:00Z",
      priority_level: "high",
      description: "Saving for first home down payment"
    },
    {
      goal_name: "Emergency Fund",
      goal_type: "emergency_fund",
      target_amount: 20000,
      current_amount: 12000,
      target_date: "2024-12-01T00:00:00Z",
      priority_level: "high",
      description: "6-month emergency fund"
    }
  ],
  liabilities: [
    {
      liability_name: "Credit Card",
      liability_type: "credit_card",
      principal_balance: 3500,
      interest_rate: 18.9,
      monthly_payment: 200,
      maturity_date: "2025-12-01T00:00:00Z"
    },
    {
      liability_name: "Student Loan",
      liability_type: "student_loan",
      principal_balance: 25000,
      interest_rate: 5.5,
      monthly_payment: 280,
      maturity_date: "2032-01-01T00:00:00Z"
    }
  ]
};

async function createUserData(email, password, userData) {
  console.log(`\n🚀 Creating financial data for ${email}`);
  console.log('='.repeat(60));
  
  // Step 1: Login
  const token = await loginUser(email, password);
  if (!token) {
    console.log(`❌ Cannot proceed without authentication token for ${email}`);
    return false;
  }
  
  let successCount = 0;
  let totalItems = 0;
  
  // Step 2: Create Assets
  console.log(`\n💰 Creating ${userData.assets.length} assets...`);
  for (const asset of userData.assets) {
    totalItems++;
    const result = await createAsset(token, asset);
    if (result) successCount++;
  }
  
  // Step 3: Create Income Sources
  console.log(`\n💵 Creating ${userData.income.length} income sources...`);
  for (const income of userData.income) {
    totalItems++;
    const result = await createIncome(token, income);
    if (result) successCount++;
  }
  
  // Step 4: Create Expenses
  console.log(`\n💸 Creating ${userData.expenses.length} expenses...`);
  for (const expense of userData.expenses) {
    totalItems++;
    const result = await createExpense(token, expense);
    if (result) successCount++;
  }
  
  // Step 5: Create Goals
  console.log(`\n🎯 Creating ${userData.goals.length} goals...`);
  for (const goal of userData.goals) {
    totalItems++;
    const result = await createGoal(token, goal);
    if (result) successCount++;
  }
  
  // Step 6: Create Liabilities
  console.log(`\n📋 Creating ${userData.liabilities.length} liabilities...`);
  for (const liability of userData.liabilities) {
    totalItems++;
    const result = await createLiability(token, liability);
    if (result) successCount++;
  }
  
  console.log(`\n📊 Summary for ${email}:`);
  console.log(`   ✅ Successfully created: ${successCount}/${totalItems} items`);
  console.log(`   Success rate: ${Math.round((successCount/totalItems) * 100)}%`);
  
  return successCount === totalItems;
}

async function main() {
  console.log('🏦 CREATING COMPREHENSIVE FINANCIAL DATA');
  console.log('='.repeat(60));
  console.log('This script will create realistic financial data for:');
  console.log('• Richard (richard.mmacharia@gmail.com)');
  console.log('• Jamal (jamal@example.com)');
  console.log('');
  
  const results = {
    richard: false,
    jamal: false
  };
  
  // Create data for Richard
  results.richard = await createUserData(
    'richard.mmacharia@gmail.com', 
    'jaggerthee',
    richardData
  );
  
  // Create data for Jamal  
  results.jamal = await createUserData(
    'jamal@example.com',
    'jamal12345',
    jamalData
  );
  
  console.log('\n🎯 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Richard's data: ${results.richard ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Jamal's data: ${results.jamal ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (results.richard && results.jamal) {
    console.log('\n🎉 All user data created successfully!');
    console.log('You can now test the UnifiedFinancialContext endpoints with real data.');
  } else {
    console.log('\n⚠️ Some data creation failed. Check the logs above for details.');
  }
}

main().catch(console.error);