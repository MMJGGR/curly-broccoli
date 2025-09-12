/**
 * Create frontend-compatible onboarding data for Richard and Jamal users
 * This matches the actual data structure used in the onboarding components
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

// Richard's onboarding data (matches frontend structure)
const richardOnboardingData = {
  personalData: {
    firstName: "Richard",
    lastName: "Macharia", 
    email: "richard.mmacharia@gmail.com",
    age: 32,
    location: "Nairobi"
  },
  riskData: {
    riskLevel: "moderate",
    riskTolerance: 6,
    investmentExperience: "intermediate"
  },
  financialData: {
    monthlyIncome: 150000,
    incomeFrequency: "Monthly",
    rent: 45000,
    utilities: 12000,
    groceries: 25000,
    transport: 18000,
    loanRepayments: 22000,
    customExpenses: [
      { id: 1, name: "Entertainment", amount: 8000 },
      { id: 2, name: "Health Insurance", amount: 6000 }
    ],
    customIncomes: [
      { id: 1, name: "Freelance Consulting", amount: 25000 },
      { id: 2, name: "Investment Dividends", amount: 3000 }
    ]
  },
  goalsData: {
    emergencyFund: 180000,
    homeDownPayment: 800000,
    education: 50000,
    retirement: 2400000,
    investment: 200000,
    debtPayoff: 150000,
    other: 100000,
    timeframes: {
      emergencyFund: '1-year',
      homeDownPayment: '3-years', 
      education: '5-years',
      retirement: '25-years',
      investment: '5-years',
      debtPayoff: '2-years'
    }
  },
  employmentData: {
    jobTitle: "Senior Software Engineer",
    company: "Tech Solutions Ltd",
    employmentType: "full-time",
    industry: "Technology"
  }
};

// Jamal's onboarding data (matches frontend structure)
const jamalOnboardingData = {
  personalData: {
    firstName: "Jamal",
    lastName: "Hassan",
    email: "jamal@example.com", 
    age: 28,
    location: "Mombasa"
  },
  riskData: {
    riskLevel: "moderate-aggressive",
    riskTolerance: 7,
    investmentExperience: "beginner"
  },
  financialData: {
    monthlyIncome: 85000,
    incomeFrequency: "Monthly",
    rent: 28000,
    utilities: 8000,
    groceries: 15000,
    transport: 12000,
    loanRepayments: 15000,
    customExpenses: [
      { id: 1, name: "Entertainment", amount: 5000 },
      { id: 2, name: "Gym Membership", amount: 3000 }
    ],
    customIncomes: [
      { id: 1, name: "Part-time Teaching", amount: 12000 }
    ]
  },
  goalsData: {
    emergencyFund: 120000,
    homeDownPayment: 500000,
    education: 80000,
    retirement: 1200000,
    investment: 100000,
    debtPayoff: 80000,
    other: 50000,
    timeframes: {
      emergencyFund: '1-year',
      homeDownPayment: '5-years',
      education: '3-years', 
      retirement: '35-years',
      investment: '3-years',
      debtPayoff: '3-years'
    }
  },
  employmentData: {
    jobTitle: "Marketing Coordinator",
    company: "Digital Marketing Co",
    employmentType: "full-time",
    industry: "Marketing"
  }
};

async function saveOnboardingData(token, onboardingData) {
  console.log('📝 Saving complete onboarding data...');
  
  let successCount = 0;
  let totalSteps = 5;
  
  try {
    // Save Step 1: Personal Data
    console.log('💼 Saving personal information...');
    const step1Result = await makeRequest('POST', '/api/v1/onboarding/save-step', {
      step_number: 1,
      step_data: onboardingData.personalData
    }, token);
    
    if (step1Result.status === 200) {
      console.log('✅ Step 1 (Personal) saved successfully');
      successCount++;
    } else {
      console.log('❌ Step 1 failed:', step1Result.data);
    }
    
    // Save Step 2: Risk Assessment
    console.log('📊 Saving risk assessment...');
    const step2Result = await makeRequest('POST', '/api/v1/onboarding/save-step', {
      step_number: 2,
      step_data: onboardingData.riskData
    }, token);
    
    if (step2Result.status === 200) {
      console.log('✅ Step 2 (Risk) saved successfully');
      successCount++;
    } else {
      console.log('❌ Step 2 failed:', step2Result.data);
    }
    
    // Save Step 3: Financial Information
    console.log('💰 Saving financial information...');
    const step3Result = await makeRequest('POST', '/api/v1/onboarding/save-step', {
      step_number: 3,
      step_data: onboardingData.financialData
    }, token);
    
    if (step3Result.status === 200) {
      console.log('✅ Step 3 (Financial) saved successfully');
      successCount++;
    } else {
      console.log('❌ Step 3 failed:', step3Result.data);
    }
    
    // Save Step 4: Goals
    console.log('🎯 Saving goals...');
    const step4Result = await makeRequest('POST', '/api/v1/onboarding/save-step', {
      step_number: 4,
      step_data: onboardingData.goalsData
    }, token);
    
    if (step4Result.status === 200) {
      console.log('✅ Step 4 (Goals) saved successfully');
      successCount++;
    } else {
      console.log('❌ Step 4 failed:', step4Result.data);
    }
    
    // Save Step 5: Employment Profile
    console.log('🏢 Saving employment profile...');
    const step5Result = await makeRequest('POST', '/api/v1/onboarding/save-step', {
      step_number: 5,
      step_data: onboardingData.employmentData
    }, token);
    
    if (step5Result.status === 200) {
      console.log('✅ Step 5 (Employment) saved successfully');
      successCount++;
    } else {
      console.log('❌ Step 5 failed:', step5Result.data);
    }
    
    // Complete onboarding
    if (successCount === totalSteps) {
      console.log('🎉 Completing onboarding process...');
      const completeResult = await makeRequest('POST', '/api/v1/onboarding/complete', {
        force_complete: true
      }, token);
      
      if (completeResult.status === 200) {
        console.log('✅ Onboarding completed successfully!');
        return true;
      } else {
        console.log('⚠️ Onboarding steps saved but completion failed:', completeResult.data);
        return false;
      }
    }
    
    console.log(`📊 Onboarding Summary: ${successCount}/${totalSteps} steps saved successfully`);
    return successCount === totalSteps;
    
  } catch (error) {
    console.log('❌ Error during onboarding save:', error.message);
    return false;
  }
}

async function createUserOnboardingData(email, password, onboardingData) {
  console.log(`\n🚀 Creating complete onboarding data for ${email}`);
  console.log('='.repeat(60));
  
  // Step 1: Login
  const token = await loginUser(email, password);
  if (!token) {
    console.log(`❌ Cannot proceed without authentication token for ${email}`);
    return false;
  }
  
  // Step 2: Save all onboarding data
  const success = await saveOnboardingData(token, onboardingData);
  
  if (success) {
    console.log(`🎉 Complete onboarding data created successfully for ${email}!`);
    console.log(`📋 Data includes: Personal info, Risk assessment, Financial details, Goals, Employment`);
  } else {
    console.log(`⚠️ Some onboarding steps may have failed for ${email}`);
  }
  
  return success;
}

async function main() {
  console.log('🏦 CREATING FRONTEND-COMPATIBLE ONBOARDING DATA');
  console.log('='.repeat(60));
  console.log('This script creates realistic onboarding data that matches the frontend structure for:');
  console.log('• Richard (richard.mmacharia@gmail.com) - Senior Software Engineer');
  console.log('• Jamal (jamal@example.com) - Marketing Coordinator');
  console.log('');
  
  const results = {
    richard: false,
    jamal: false
  };
  
  // Create complete onboarding data for Richard
  results.richard = await createUserOnboardingData(
    'richard.mmacharia@gmail.com', 
    'jaggerthee',
    richardOnboardingData
  );
  
  // Create complete onboarding data for Jamal  
  results.jamal = await createUserOnboardingData(
    'jamal@example.com',
    'jamal12345',
    jamalOnboardingData
  );
  
  console.log('\n🎯 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Richard's onboarding: ${results.richard ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Jamal's onboarding: ${results.jamal ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (results.richard && results.jamal) {
    console.log('\n🎉 All onboarding data created successfully!');
    console.log('✨ The data will now be automatically converted to backend format');
    console.log('📊 You can test the UnifiedFinancialContext endpoints with real data.');
    console.log('🔄 The onboarding completion should trigger data persistence to assets, income, expenses, goals, etc.');
  } else {
    console.log('\n⚠️ Some onboarding data creation failed. Check the logs above for details.');
  }
}

main().catch(console.error);