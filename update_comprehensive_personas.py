#!/usr/bin/env python3
"""
Update existing personas with comprehensive financial data
Based on PERSONAS_SOURCE_OF_TRUTH.md
"""
import requests
import json

API_BASE = "http://localhost:8000"

# Comprehensive persona data matching PERSONAS_SOURCE_OF_TRUTH.md
comprehensive_personas = [
    {
        "email": "jamal@example.com",
        "password": "jamal12345",
        "role": "user",
        "profile": {
            "first_name": "Jamal",
            "last_name": "Mwangi",
            "date_of_birth": "1997-06-10",
            "annual_income": 636000,
            "employment_status": "Employed",
            "dependents": 0,
            "kra_pin": "A123456789B",
            "nationalId": "34567890",
            "phone_number": "+254712345678",
            "address": "Kileleshwa, Nairobi",
            "marital_status": "Single",
            "education": "Bachelor",
            "occupation": "Software Developer",
            "monthly_income": 53000,
            "monthly_expenses": 50500,
            "debt_total": 195000,
            "emergency_fund": 25000,
            "investment_experience": "Beginner",
            "financial_goals": [
                "Emergency Fund: KES 120,000 by Feb 2026",
                "Student Loan Payoff: KES 180,000 by Aug 2027", 
                "First Investment: KES 50,000 by Feb 2025"
            ]
        }
    },
    {
        "email": "aisha@example.com",
        "password": "aisha12345", 
        "role": "user",
        "profile": {
            "first_name": "Aisha",
            "last_name": "Otieno",
            "date_of_birth": "1987-03-15",
            "annual_income": 1448000,
            "employment_status": "Employed",
            "dependents": 2,
            "kra_pin": "A987654321C",
            "nationalId": "23456789",
            "phone_number": "+254787654321",
            "address": "Kisumu",
            "marital_status": "Married",
            "education": "Masters",
            "occupation": "Banking Manager",
            "monthly_income": 120667,
            "monthly_expenses": 110200,
            "debt_total": 2705000,
            "emergency_fund": 180000,
            "investment_experience": "Intermediate",
            "financial_goals": [
                "Children University Fund: KES 4,000,000 by Jan 2030",
                "Mortgage Payoff: KES 2,400,000 by Jan 2034",
                "Retirement Fund: KES 10,000,000 by Jan 2049"
            ]
        }
    },
    {
        "email": "samuel@example.com",
        "password": "samuel12345",
        "role": "user", 
        "profile": {
            "first_name": "Samuel",
            "last_name": "Kariuki",
            "date_of_birth": "1970-08-22",
            "annual_income": 1920000,
            "employment_status": "Executive",
            "dependents": 0,
            "kra_pin": "A456789123D",
            "nationalId": "12345678",
            "phone_number": "+254722333444",
            "address": "Nairobi",
            "marital_status": "Married",
            "education": "Masters",
            "occupation": "CEO",
            "monthly_income": 160000,
            "monthly_expenses": 120000,
            "debt_total": 1800000,
            "emergency_fund": 450000,
            "investment_experience": "Advanced",
            "financial_goals": [
                "Retirement Fund: KES 20,000,000 by Aug 2035",
                "Debt Freedom: KES 1,800,000 by Aug 2029",
                "Legacy Planning: KES 5,000,000 by Aug 2035"
            ]
        }
    },
    {
        "email": "emily@advisor.com",
        "password": "emily12345",
        "role": "advisor",
        "profile": {
            "first_name": "Emily",
            "last_name": "Njeri",
            "date_of_birth": "1982-11-28",
            "annual_income": 2820000,
            "employment_status": "Self-employed",
            "dependents": 1,
            "kra_pin": "A789123456E",
            "nationalId": "45678901",
            "phone_number": "+254733444555",
            "address": "Nairobi",
            "marital_status": "Divorced",
            "education": "PhD",
            "occupation": "Financial Advisor",
            "monthly_income": 235000,
            "monthly_expenses": 185000,
            "debt_total": 2200000,
            "emergency_fund": 600000,
            "investment_experience": "Expert",
            # Advisor-specific fields
            "firm_name": "Njeri Financial Advisors",
            "license_number": "CFP2024001",
            "professional_email": "emily@advisor.com",
            "service_model": "fee-only",
            "target_client_type": "high-net-worth",
            "minimum_aum": "2000000"
        }
    }
]

def update_persona_profile(persona):
    """Update an existing persona's profile with comprehensive data"""
    print(f"Updating persona: {persona['email']}")
    
    # Login to get token
    login_data = {
        "username": persona["email"],
        "password": persona["password"]
    }
    
    try:
        login_response = requests.post(f"{API_BASE}/auth/login", data=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            
            # Update profile with comprehensive data
            profile_response = requests.put(f"{API_BASE}/auth/profile", 
                                          headers=headers, 
                                          json=persona["profile"])
            
            if profile_response.status_code == 200:
                print(f"SUCCESS: Updated comprehensive profile for {persona['email']}")
                
                # Display updated fields count
                updated_fields = len(persona["profile"])
                print(f"  - Updated {updated_fields} profile fields")
                
                # Show key financial metrics
                profile = persona["profile"]
                print(f"  - Annual Income: KES {profile.get('annual_income', 0):,}")
                print(f"  - Monthly Income: KES {profile.get('monthly_income', 0):,}")
                print(f"  - Emergency Fund: KES {profile.get('emergency_fund', 0):,}")
                print(f"  - Total Debt: KES {profile.get('debt_total', 0):,}")
                
                if persona["role"] == "advisor":
                    print(f"  - Firm: {profile.get('firm_name', 'N/A')}")
                    print(f"  - License: {profile.get('license_number', 'N/A')}")
                    print(f"  - Min AUM: KES {profile.get('minimum_aum', 'N/A')}")
                    
            else:
                print(f"ERROR: Failed to update profile for {persona['email']}")
                print(f"  Status: {profile_response.status_code}")
                print(f"  Response: {profile_response.text}")
                
        else:
            print(f"ERROR: Failed to login {persona['email']}")
            print(f"  Status: {login_response.status_code}") 
            print(f"  Response: {login_response.text}")
            
    except Exception as e:
        print(f"ERROR: Exception updating {persona['email']}: {str(e)}")

def verify_persona_data(persona):
    """Verify that persona data was updated correctly"""
    print(f"Verifying persona: {persona['email']}")
    
    login_data = {
        "username": persona["email"],
        "password": persona["password"]
    }
    
    try:
        login_response = requests.post(f"{API_BASE}/auth/login", data=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Get profile data
            profile_response = requests.get(f"{API_BASE}/auth/me", headers=headers)
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print(f"VERIFIED: {persona['email']}")
                print(f"  - Name: {profile_data.get('first_name', 'N/A')} {profile_data.get('last_name', 'N/A')}")
                print(f"  - Income: KES {profile_data.get('annual_income', 0):,}")
                print(f"  - Role: {profile_data.get('role', 'N/A')}")
                
                if persona["role"] == "advisor":
                    print(f"  - Firm: {profile_data.get('firm_name', 'N/A')}")
                    
                return True
            else:
                print(f"FAILED: Could not retrieve profile for {persona['email']}")
                return False
                
        else:
            print(f"FAILED: Could not login {persona['email']}")
            return False
            
    except Exception as e:
        print(f"ERROR: Exception verifying {persona['email']}: {str(e)}")
        return False

if __name__ == "__main__":
    print("Updating personas with comprehensive financial data...")
    print("Based on: PERSONAS_SOURCE_OF_TRUTH.md")
    print("=" * 60)
    
    updated_count = 0
    verified_count = 0
    
    for persona in comprehensive_personas:
        update_persona_profile(persona)
        print()
        updated_count += 1
    
    print("=" * 60)
    print("Verifying updated persona data...")
    print()
    
    for persona in comprehensive_personas:
        if verify_persona_data(persona):
            verified_count += 1
        print()
    
    print("=" * 60)
    print(f"SUMMARY:")
    print(f"  - Personas Updated: {updated_count}/{len(comprehensive_personas)}")
    print(f"  - Personas Verified: {verified_count}/{len(comprehensive_personas)}")
    
    if verified_count == len(comprehensive_personas):
        print("All personas successfully updated with comprehensive data!")
        print("Ready for comprehensive testing with full financial profiles")
    else:
        print("Some personas may need manual verification")
    
    print()
    print("Persona documentation: PERSONAS_SOURCE_OF_TRUTH.md")
    print("Test file: frontend/cypress/e2e/comprehensive-persona-onboarding.cy.js")
    print()
    print("Done!")