#!/usr/bin/env python3
import requests
import json

# Test the profile update with debug info
API_BASE = "http://localhost:8000"
test_email = "debug_advisor@example.com"

def test_advisor_profile_update():
    print("🔍 Debugging Advisor Profile Update")
    print("==================================")
    
    # Step 1: Register
    register_data = {
        "email": test_email,
        "password": "testpass123",
        "user_type": "advisor",
        "first_name": "Debug",
        "last_name": "Advisor",
        "dob": "1985-01-01",
        "nationalId": "DBG123456",
        "kra_pin": "D987654321Z",
        "annual_income": 150000,
        "dependents": 0,
        "goals": {"targetAmount": 50000, "timeHorizon": 24},
        "questionnaire": [4, 4, 3, 4, 4]
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=register_data)
    if response.status_code not in [200, 201]:
        print(f"❌ Registration failed: {response.status_code} - {response.text}")
        return
    
    token = response.json()["access_token"]
    print(f"✅ Registration successful, token: {token[:20]}...")
    
    # Step 2: Update with advisor fields
    advisor_data = {
        "first_name": "Emily",
        "last_name": "Chen",
        "firm_name": "Chen Financial Planning",
        "license_number": "CFP123456",
        "professional_email": "emily@chenfinancial.com",
        "service_model": "fee-only",
        "target_client_type": "high-net-worth",
        "minimum_aum": "500000",
        "phone": "+1-555-0123",
        "dob": "1985-01-01",
        "nationalId": "DBG123456",
        "kra_pin": "D987654321Z",
        "annual_income": 300000,
        "dependents": 0,
        "goals": {"targetAmount": 100000, "timeHorizon": 24},
        "questionnaire": [4, 4, 3, 4, 4]
    }
    
    print(f"\n📤 Sending advisor data:")
    print(json.dumps(advisor_data, indent=2))
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(f"{API_BASE}/auth/profile", json=advisor_data, headers=headers)
    print(f"\n📥 Profile update response ({response.status_code}):")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code not in [200, 201]:
        print(f"❌ Profile update failed")
        return
    
    # Step 3: Retrieve profile to see what was saved
    response = requests.get(f"{API_BASE}/auth/me", headers=headers)
    print(f"\n📋 Profile retrieval response ({response.status_code}):")
    print(json.dumps(response.json(), indent=2))
    
    profile = response.json().get("profile", {})
    advisor_fields = ["firm_name", "license_number", "professional_email", "service_model", "target_client_type", "minimum_aum"]
    
    print(f"\n🔍 Advisor fields check:")
    for field in advisor_fields:
        value = profile.get(field)
        status = "✅" if value else "❌"
        print(f"   {status} {field}: {value}")

if __name__ == "__main__":
    test_advisor_profile_update()