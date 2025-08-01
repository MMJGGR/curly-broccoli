#!/usr/bin/env python3
"""
Create test personas for the Personal Finance App
"""
import requests
import json

API_BASE = "http://localhost:8000"

personas = [
    {
        "email": "jamal@example.com",
        "password": "jamal12345",
        "role": "user",
        "profile": {
            "first_name": "Jamal",
            "last_name": "Mwangi",
            "date_of_birth": "1997-06-10",
            "annual_income": 480000,
            "employment_status": "Employed",
            "dependents": 0
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
            "annual_income": 800000,
            "employment_status": "Employed",
            "dependents": 2
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
            "annual_income": 1200000,
            "employment_status": "Employed",
            "dependents": 0
        }
    },
    {
        "email": "emily@advisor.com",
        "password": "emily12345",
        "role": "advisor",
        "profile": {
            "first_name": "Emily",
            "last_name": "Njeri",
            "firm_name": "Njeri Financial Advisors",
            "license_number": "CFP2024001",
            "professional_email": "emily@advisor.com"
        }
    }
]

def create_persona(persona):
    """Create a persona via the registration API"""
    print(f"Creating persona: {persona['email']}")
    
    # Register user
    register_data = {
        "email": persona["email"],
        "password": persona["password"],
        "role": persona["role"]
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=register_data)
    if response.status_code == 201:
        print(f"SUCCESS: Registered {persona['email']}")
        
        # Login to get token
        login_data = {
            "username": persona["email"],
            "password": persona["password"]
        }
        login_response = requests.post(f"{API_BASE}/auth/login", data=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            
            # Update profile
            profile_response = requests.put(f"{API_BASE}/auth/profile", 
                                          headers=headers, 
                                          json=persona["profile"])
            
            if profile_response.status_code == 200:
                print(f"SUCCESS: Updated profile for {persona['email']}")
            else:
                print(f"ERROR: Failed to update profile for {persona['email']}: {profile_response.text}")
        else:
            print(f"ERROR: Failed to login {persona['email']}: {login_response.text}")
    else:
        print(f"ERROR: Failed to register {persona['email']}: {response.text}")

if __name__ == "__main__":
    print("Creating test personas...")
    for persona in personas:
        create_persona(persona)
        print()
    
    print("Done!")