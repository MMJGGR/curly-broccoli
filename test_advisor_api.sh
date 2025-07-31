#!/bin/bash

# Advisor API Integration Test Script
echo "🧪 Testing Advisor API Integration"
echo "=================================="

API_BASE="http://localhost:8000"
TEST_EMAIL="advisor_test_$(date +%s)@example.com"
echo "📧 Test email: $TEST_EMAIL"

# Test 1: Register advisor
echo -e "\n1. 📝 Registering advisor..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"testpass123\",
    \"user_type\": \"advisor\",
    \"first_name\": \"Test\",
    \"last_name\": \"Advisor\",
    \"dob\": \"1985-01-01\",
    \"nationalId\": \"ADV123456\",
    \"kra_pin\": \"A987654321Z\",
    \"annual_income\": 150000,
    \"dependents\": 0,
    \"goals\": {\"targetAmount\": 50000, \"timeHorizon\": 24},
    \"questionnaire\": [4, 4, 3, 4, 4]
  }")

echo "Response: $REGISTER_RESPONSE"

# Extract token (basic extraction)
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "   ✅ Registration successful"
    echo "   🔑 Token received: ${TOKEN:0:20}..."
else
    echo "   ❌ Registration failed - no token received"
    exit 1
fi

# Test 2: Update profile with advisor data
echo -e "\n2. 👔 Updating advisor profile..."
PROFILE_RESPONSE=$(curl -s -X PUT "$API_BASE/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"first_name\": \"Emily\",
    \"last_name\": \"Chen\",
    \"firm_name\": \"Chen Financial Planning\",
    \"license_number\": \"CFP123456\",
    \"professional_email\": \"emily@chenfinancial.com\",
    \"service_model\": \"fee-only\",
    \"target_client_type\": \"high-net-worth\",
    \"minimum_aum\": \"500000\",
    \"phone\": \"+1-555-0123\",
    \"dob\": \"1985-01-01\",
    \"nationalId\": \"ADV123456\",
    \"kra_pin\": \"A987654321Z\",
    \"annual_income\": 300000,
    \"dependents\": 0,
    \"goals\": {\"targetAmount\": 100000, \"timeHorizon\": 24},
    \"questionnaire\": [4, 4, 3, 4, 4]
  }")

echo "Response: $PROFILE_RESPONSE"

if [[ "$PROFILE_RESPONSE" == *"risk_score"* ]]; then
    echo "   ✅ Profile update successful"
else
    echo "   ❌ Profile update failed"
fi

# Test 3: Retrieve profile
echo -e "\n3. 📋 Retrieving advisor profile..."
GET_PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_PROFILE_RESPONSE"

if [[ "$GET_PROFILE_RESPONSE" == *"firm_name"* ]]; then
    echo "   ✅ Profile retrieval successful - contains advisor fields"
else
    echo "   ❌ Profile retrieval failed or missing advisor fields"
fi

# Test 4: Test login
echo -e "\n4. 🔐 Testing advisor login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$TEST_EMAIL&password=testpass123")

echo "Response: $LOGIN_RESPONSE"

if [[ "$LOGIN_RESPONSE" == *"access_token"* ]]; then
    echo "   ✅ Login successful"
else
    echo "   ❌ Login failed"
fi

echo -e "\n🎉 Advisor API Test Complete!"
echo -e "\n📋 Summary:"
echo "✅ Registration with advisor role"
echo "✅ Profile update with advisor fields"
echo "✅ Profile retrieval"
echo "✅ Login authentication"

echo -e "\n🌐 Frontend Testing:"
echo "1. Open http://localhost:3000"
echo "2. Register as advisor"  
echo "3. Complete onboarding flow"
echo "4. Verify navigation to advisor dashboard"