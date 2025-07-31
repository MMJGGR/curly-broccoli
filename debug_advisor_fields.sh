#!/bin/bash

# Debug Advisor Fields Test
echo "DEBUG: Testing Advisor Field Updates"
echo "===================================="

API_BASE="http://localhost:8000"
TEST_EMAIL="debug_advisor_$(date +%s)@example.com"

# Register advisor
echo "1. Registering advisor..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"testpass123\",
    \"user_type\": \"advisor\",
    \"first_name\": \"Debug\",
    \"last_name\": \"Advisor\"
  }")

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"sub":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "   ✅ Registration successful"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "   ❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
    exit 1
fi

# Update with advisor fields - using exact field names
echo -e "\n2. Updating with advisor fields..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Emily",
    "last_name": "Chen",
    "date_of_birth": "1985-01-01",
    "firm_name": "Chen Financial Planning",
    "license_number": "CFP123456", 
    "professional_email": "emily@chenfinancial.com",
    "service_model": "fee-only",
    "target_client_type": "high-net-worth",
    "minimum_aum": "500000"
  }')

echo "Update Response: $UPDATE_RESPONSE"

# Check database directly
echo -e "\n3. Checking database directly..."
docker exec curly-broccoli-db-1 psql -U user -d finance_app -c "SELECT user_id, first_name, last_name, firm_name, license_number, service_model, target_client_type FROM profiles WHERE user_id = (SELECT id FROM users WHERE email = '$TEST_EMAIL');"

# Try GET endpoint
echo -e "\n4. Getting profile via API..."
GET_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "GET Response: $GET_RESPONSE"

echo -e "\n5. Analysis:"
if [[ "$GET_RESPONSE" == *"firm_name"* ]]; then
    echo "   ✅ firm_name field present in API response"
else
    echo "   ❌ firm_name field missing from API response"
fi

if [[ "$GET_RESPONSE" == *"Chen Financial Planning"* ]]; then
    echo "   ✅ firm_name value present in API response"
else
    echo "   ❌ firm_name value missing from API response"
fi