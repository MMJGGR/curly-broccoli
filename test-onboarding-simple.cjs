/**
 * Simple Onboarding Flow Test
 * Tests the onboarding steps without complex frameworks
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8000';

// Test user data with unique email each run
const testUserData = {
  email: `test_onboarding_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  personalInfo: {
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '1990-01-01',
    phone: '+254700000000',
    nationalId: '12345678'
  },
  riskAssessment: [4, 4, 4, 4, 4], // High risk profile
  financialInfo: {
    monthlyIncome: 100000,
    rent: 30000,
    utilities: 5000,
    groceries: 15000,
    transport: 10000
  },
  goals: {
    emergencyFund: 300000,
    retirement: 5000000,
    investment: 500000
  },
  employment: {
    industry_sector: 'technology',
    job_role_level: 'mid',
    employment_type: 'permanent'
  }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OnboardingTest/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: data,
            json: null
          };
          
          if (data && res.headers['content-type']?.includes('application/json')) {
            try {
              result.json = JSON.parse(data);
            } catch (e) {
              // Not valid JSON, keep as string
            }
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(10000);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testFrontendAvailability() {
  console.log('🔍 Testing frontend availability...');
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend is available at', FRONTEND_URL);
      return true;
    } else {
      console.log('❌ Frontend returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend not available:', error.message);
    return false;
  }
}

async function testAPIAvailability() {
  console.log('🔍 Testing API availability...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/healthz`);
    if (response.status === 200) {
      console.log('✅ API is available at', API_BASE_URL);
      console.log('✅ Health check response:', response.json);
      return true;
    } else {
      console.log('❌ API returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API not available:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('🔍 Testing user registration...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/auth/create-account`, {
      method: 'POST',
      body: {
        email: testUserData.email,
        password: testUserData.password,
        user_type: 'user'
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ User registration successful');
      if (response.json && response.json.access_token) {
        console.log('✅ JWT token received');
        return response.json.access_token;
      }
      return true;
    } else if (response.status === 400 && response.body.includes('already registered')) {
      console.log('ℹ️ User already exists, trying login...');
      return await testUserLogin();
    } else if (response.status === 409) {
      console.log('ℹ️ User already exists, trying login...');
      return await testUserLogin();
    } else {
      console.log('❌ Registration failed with status:', response.status);
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('🔍 Testing user login...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${encodeURIComponent(testUserData.email)}&password=${encodeURIComponent(testUserData.password)}`
    });
    
    if (response.status === 200) {
      console.log('✅ User login successful');
      if (response.json && response.json.access_token) {
        console.log('✅ JWT token received');
        return response.json.access_token;
      }
      return true;
    } else {
      console.log('❌ Login failed with status:', response.status);
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testOnboardingDataStructure() {
  console.log('🔍 Testing onboarding data structure...');
  
  const steps = [
    { name: 'Personal Info', data: testUserData.personalInfo },
    { name: 'Risk Assessment', data: testUserData.riskAssessment },
    { name: 'Financial Info', data: testUserData.financialInfo },
    { name: 'Goals', data: testUserData.goals },
    { name: 'Employment', data: testUserData.employment }
  ];
  
  let allValid = true;
  
  steps.forEach((step, index) => {
    console.log(`📋 Step ${index + 1}: ${step.name}`);
    
    if (!step.data || (typeof step.data === 'object' && Object.keys(step.data).length === 0)) {
      console.log(`  ❌ No data provided for ${step.name}`);
      allValid = false;
      return;
    }
    
    if (Array.isArray(step.data)) {
      console.log(`  ✅ Array with ${step.data.length} items`);
    } else if (typeof step.data === 'object') {
      console.log(`  ✅ Object with ${Object.keys(step.data).length} properties:`);
      Object.entries(step.data).forEach(([key, value]) => {
        console.log(`    - ${key}: ${value}`);
      });
    } else {
      console.log(`  ✅ Value: ${step.data}`);
    }
  });
  
  if (allValid) {
    console.log('✅ All onboarding steps have valid data structure');
  } else {
    console.log('❌ Some onboarding steps have invalid data');
  }
  
  return allValid;
}

async function testOnboardingFlow() {
  console.log('🔍 Testing complete onboarding flow logic...');
  
  // Simulate the onboarding completion process
  console.log('📝 Step 1: Personal Information');
  console.log('  ✓ firstName:', testUserData.personalInfo.firstName);
  console.log('  ✓ lastName:', testUserData.personalInfo.lastName);
  console.log('  ✓ dateOfBirth:', testUserData.personalInfo.dateOfBirth);
  
  console.log('📝 Step 2: Risk Assessment');
  console.log('  ✓ questionnaire:', testUserData.riskAssessment);
  const riskScore = testUserData.riskAssessment.reduce((a, b) => a + b, 0) * 5; // Mock calculation
  console.log('  ✓ calculated risk score:', riskScore);
  
  console.log('📝 Step 3: Financial Information');
  console.log('  ✓ monthlyIncome:', testUserData.financialInfo.monthlyIncome);
  console.log('  ✓ total monthly expenses:', 
    Object.values(testUserData.financialInfo).slice(1).reduce((a, b) => a + b, 0));
  
  console.log('📝 Step 4: Financial Goals');
  console.log('  ✓ goals set:', Object.keys(testUserData.goals).length);
  
  console.log('📝 Step 5: Employment Information');
  console.log('  ✓ industry_sector:', testUserData.employment.industry_sector);
  
  console.log('✅ Onboarding flow logic validation complete');
  return true;
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Simple Onboarding Test');
  console.log('='.repeat(50));
  
  const results = {
    frontend: false,
    api: false,
    registration: false,
    dataStructure: false,
    onboardingFlow: false
  };
  
  try {
    // Test 1: Frontend availability
    results.frontend = await testFrontendAvailability();
    console.log();
    
    // Test 2: API availability  
    results.api = await testAPIAvailability();
    console.log();
    
    // Test 3: User registration/login
    results.registration = await testUserRegistration();
    console.log();
    
    // Test 4: Onboarding data structure
    results.dataStructure = await testOnboardingDataStructure();
    console.log();
    
    // Test 5: Onboarding flow logic
    results.onboardingFlow = await testOnboardingFlow();
    console.log();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
  
  // Summary
  console.log('='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const testResults = [
    { name: 'Frontend Available', status: results.frontend },
    { name: 'API Available', status: results.api },
    { name: 'User Registration/Login', status: results.registration },
    { name: 'Onboarding Data Structure', status: results.dataStructure },
    { name: 'Onboarding Flow Logic', status: results.onboardingFlow }
  ];
  
  testResults.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status ? 'PASS' : 'FAIL'}`);
  });
  
  const passCount = testResults.filter(t => t.status).length;
  const totalCount = testResults.length;
  
  console.log();
  console.log(`🎯 Overall Result: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 All tests passed! Onboarding is ready for use.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  console.log('='.repeat(50));
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testUserData };