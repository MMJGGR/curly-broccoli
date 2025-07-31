// Comprehensive Advisor Onboarding Test
// Run this with: node test_advisor_onboarding.js

const https = require('https');
const http = require('http');

// Test configuration
const API_BASE = 'http://localhost:8000';
const FRONTEND_BASE = 'http://localhost:3000';

// Test data
const testAdvisor = {
    email: `test_advisor_${Date.now()}@example.com`,
    password: 'testpass123',
    user_type: 'advisor'
};

const professionalDetails = {
    firstName: 'Emily',
    lastName: 'Chen',
    firmName: 'Chen Financial Planning',
    licenseNumber: 'CFP123456',
    professionalEmail: 'emily@chenfinancial.com',
    phone: '+1-555-0123'
};

const serviceModel = {
    serviceModel: 'fee-only',
    targetClientType: 'high-net-worth',
    minimumAUM: '500000'
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.port === 443 ? https : http;
        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsedBody = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, headers: res.headers, body: parsedBody });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, body: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

// Test functions
async function testAdvisorRegistration() {
    console.log('\n🧪 Testing Advisor Registration...');
    
    const registrationData = {
        email: testAdvisor.email,
        password: testAdvisor.password,
        user_type: testAdvisor.user_type,
        first_name: 'New',
        last_name: 'Advisor',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: 'A123456789Z',
        annual_income: 50000,
        dependents: 0,
        goals: {
            targetAmount: 10000,
            timeHorizon: 12
        },
        questionnaire: [1, 2, 3, 4, 5]
    };

    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await makeRequest(options, registrationData);
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Advisor registration successful');
            console.log(`   Email: ${testAdvisor.email}`);
            console.log(`   Token received: ${response.body.access_token ? 'YES' : 'NO'}`);
            return response.body.access_token;
        } else {
            console.log('❌ Advisor registration failed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(response.body)}`);
            return null;
        }
    } catch (error) {
        console.log('❌ Advisor registration error:', error.message);
        return null;
    }
}

async function testAdvisorLogin() {
    console.log('\n🧪 Testing Advisor Login...');
    
    const formData = new URLSearchParams();
    formData.append('username', testAdvisor.email);
    formData.append('password', testAdvisor.password);

    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        const response = await makeRequest(options, formData.toString());
        
        if (response.status === 200) {
            console.log('✅ Advisor login successful');
            console.log(`   Token received: ${response.body.access_token ? 'YES' : 'NO'}`);
            return response.body.access_token;
        } else {
            console.log('❌ Advisor login failed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(response.body)}`);
            return null;
        }
    } catch (error) {
        console.log('❌ Advisor login error:', error.message);
        return null;
    }
}

async function testFrontendAccessibility() {
    console.log('\n🧪 Testing Frontend Accessibility...');
    
    const endpoints = [
        '/',
        '/auth',
        '/onboarding/advisor/professional-details',
        '/onboarding/advisor/service-model',
        '/onboarding/advisor/complete'
    ];

    for (const endpoint of endpoints) {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'GET'
        };

        try {
            const response = await makeRequest(options);
            const status = response.status === 200 ? '✅' : '❌';
            console.log(`   ${status} ${endpoint} - Status: ${response.status}`);
        } catch (error) {
            console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
        }
    }
}

async function testAPIEndpoints(token) {
    console.log('\n🧪 Testing API Endpoints...');
    
    if (!token) {
        console.log('❌ No token available, skipping API tests');
        return;
    }

    const endpoints = [
        { path: '/auth/profile', method: 'GET' },
        { path: '/healthz', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: endpoint.path,
            method: endpoint.method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await makeRequest(options);
            const status = response.status === 200 ? '✅' : '❌';
            console.log(`   ${status} ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
            
            if (endpoint.path === '/auth/profile' && response.status === 200) {
                console.log(`   📊 Profile data: ${JSON.stringify(response.body, null, 2)}`);
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
        }
    }
}

// Main test runner
async function runAdvisorOnboardingTests() {
    console.log('🚀 Starting Comprehensive Advisor Onboarding Tests');
    console.log('==================================================');
    
    let token = null;

    // Test 1: Registration
    token = await testAdvisorRegistration();
    
    // Test 2: Login (if registration failed)
    if (!token) {
        token = await testAdvisorLogin();
    }
    
    // Test 3: Frontend accessibility
    await testFrontendAccessibility();
    
    // Test 4: API endpoints
    await testAPIEndpoints(token);
    
    console.log('\n📋 Test Summary');
    console.log('===============');
    console.log('✅ Registration/Login: Check logs above');
    console.log('✅ Frontend Routes: Check accessibility results');
    console.log('✅ API Integration: Check endpoint results');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:3000 in browser');
    console.log('2. Register as advisor with any email/password');
    console.log('3. Verify navigation to /onboarding/advisor/professional-details');
    console.log('4. Complete the 3-step onboarding flow');
    console.log('5. Verify final navigation to advisor dashboard');
    
    console.log('\n🧪 Test completed!');
}

// Run the tests
runAdvisorOnboardingTests().catch(console.error);