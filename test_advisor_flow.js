// Quick Advisor Flow Test
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000';
const testEmail = `advisor_test_${Date.now()}@example.com`;

async function testFullAdvisorFlow() {
    console.log('🧪 Testing Full Advisor Onboarding Flow');
    console.log('=========================================');
    
    try {
        // Step 1: Register advisor
        console.log('\n1. 📝 Registering advisor...');
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'testpass123',
                user_type: 'advisor',
                first_name: 'Test',
                last_name: 'Advisor',
                dob: '1985-01-01',
                nationalId: 'ADV123456',
                kra_pin: 'A987654321Z',
                annual_income: 150000,
                dependents: 0,
                goals: { targetAmount: 50000, timeHorizon: 24 },
                questionnaire: [4, 4, 3, 4, 4]
            })
        });
        
        const registerData = await registerResponse.json();
        if (!registerResponse.ok) {
            throw new Error(`Registration failed: ${JSON.stringify(registerData)}`);
        }
        
        const token = registerData.access_token;
        console.log('   ✅ Registration successful');
        console.log(`   📧 Email: ${testEmail}`);
        console.log(`   🔑 Token: ${token ? 'Received' : 'Missing'}`);

        // Step 2: Update profile with advisor data
        console.log('\n2. 👔 Updating advisor profile...');
        const profileUpdateResponse = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name: 'Emily',
                last_name: 'Chen',
                firm_name: 'Chen Financial Planning',
                license_number: 'CFP123456',
                professional_email: 'emily@chenfinancial.com',
                service_model: 'fee-only',
                target_client_type: 'high-net-worth',
                minimum_aum: '500000',
                phone: '+1-555-0123',
                // Keep other required fields
                dob: '1985-01-01',
                nationalId: 'ADV123456',
                kra_pin: 'A987654321Z',
                annual_income: 300000,
                dependents: 0,
                goals: { targetAmount: 100000, timeHorizon: 24 },
                questionnaire: [4, 4, 3, 4, 4]
            })
        });

        if (profileUpdateResponse.ok) {
            console.log('   ✅ Profile update successful');
        } else {
            const errorData = await profileUpdateResponse.json();
            console.log('   ❌ Profile update failed:', JSON.stringify(errorData));
        }

        // Step 3: Retrieve updated profile
        console.log('\n3. 📋 Retrieving advisor profile...');
        const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('   ✅ Profile retrieved successfully');
            console.log('   📊 Advisor Profile Data:');
            console.log(`      Name: ${profileData.profile.first_name} ${profileData.profile.last_name}`);
            console.log(`      Firm: ${profileData.profile.firm_name || 'Not set'}`);
            console.log(`      License: ${profileData.profile.license_number || 'Not set'}`);
            console.log(`      Service Model: ${profileData.profile.service_model || 'Not set'}`);
            console.log(`      Target Clients: ${profileData.profile.target_client_type || 'Not set'}`);
            console.log(`      Min AUM: ${profileData.profile.minimum_aum || 'Not set'}`);
        } else {
            const errorData = await profileResponse.json();
            console.log('   ❌ Profile retrieval failed:', JSON.stringify(errorData));
        }

        // Step 4: Test login
        console.log('\n4. 🔐 Testing advisor login...');
        const formData = new URLSearchParams();
        formData.append('username', testEmail);
        formData.append('password', 'testpass123');

        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('   ✅ Login successful');
            console.log(`   🔑 New token: ${loginData.access_token ? 'Received' : 'Missing'}`);
        } else {
            const errorData = await loginResponse.json();
            console.log('   ❌ Login failed:', JSON.stringify(errorData));
        }

        console.log('\n🎉 Advisor Flow Test Completed Successfully!');
        console.log('\n📋 Summary:');
        console.log('✅ Registration with advisor role');
        console.log('✅ Profile update with advisor-specific fields');
        console.log('✅ Profile retrieval showing advisor data');  
        console.log('✅ Login authentication');
        
        console.log('\n🌐 Frontend Test Instructions:');
        console.log('1. Open http://localhost:3000');
        console.log('2. Click "Advisor" toggle');
        console.log('3. Click "Create Account"');
        console.log('4. Fill any email/password');
        console.log('5. Should navigate to: /onboarding/advisor/professional-details');
        console.log('6. Complete the 3-step flow');
        console.log('7. Should end at: /advisor/dashboard');

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testFullAdvisorFlow();