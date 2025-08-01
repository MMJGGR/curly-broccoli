#!/usr/bin/env python3
"""
Populate personas with comprehensive financial data
Based on PERSONAS_SOURCE_OF_TRUTH.md
Adds goals and expense categories for all personas
"""
import requests
import json

API_BASE = "http://localhost:8000"

# Comprehensive financial data from PERSONAS_SOURCE_OF_TRUTH.md
PERSONA_FINANCIAL_DATA = {
    "jamal": {
        "email": "jamal@example.com",
        "password": "jamal12345",
        "goals": [
            {
                "name": "Emergency Fund",
                "target": 120000,
                "current": 25000,
                "target_date": "2026-02-01",
                "description": "3 months expenses emergency fund"
            },
            {
                "name": "Student Loan Payoff", 
                "target": 180000,
                "current": 0,
                "target_date": "2027-08-01",
                "description": "Pay off remaining student loan debt"
            },
            {
                "name": "First Investment",
                "target": 50000,
                "current": 0,
                "target_date": "2025-02-01",
                "description": "Start SACCO contribution"
            }
        ],
        "expense_categories": [
            {"name": "Rent", "budgeted_amount": 18000},
            {"name": "Food & Groceries", "budgeted_amount": 8000},
            {"name": "Transportation", "budgeted_amount": 6000},
            {"name": "Student Loan Payment", "budgeted_amount": 4500},
            {"name": "Phone & Internet", "budgeted_amount": 3500},
            {"name": "Entertainment", "budgeted_amount": 2000},
            {"name": "Health Insurance (NHIF)", "budgeted_amount": 1700},
            {"name": "Life Insurance", "budgeted_amount": 2520},
            {"name": "Retirement (NSSF)", "budgeted_amount": 1080}
        ]
    },
    
    "aisha": {
        "email": "aisha@example.com",
        "password": "aisha12345",
        "goals": [
            {
                "name": "Children University Fund",
                "target": 4000000,
                "current": 350000,
                "target_date": "2030-01-01",
                "description": "University education for 2 children"
            },
            {
                "name": "Mortgage Payoff",
                "target": 2400000,
                "current": 0,
                "target_date": "2034-01-01", 
                "description": "Pay off mortgage early"
            },
            {
                "name": "Retirement Fund",
                "target": 10000000,
                "current": 240000,
                "target_date": "2049-01-01",
                "description": "Comprehensive retirement planning"
            }
        ],
        "expense_categories": [
            {"name": "Mortgage Payment", "budgeted_amount": 28000},
            {"name": "School Fees", "budgeted_amount": 24000},
            {"name": "Food & Groceries", "budgeted_amount": 15000},
            {"name": "Domestic Help", "budgeted_amount": 12000},
            {"name": "Car Loan Payment", "budgeted_amount": 8500},
            {"name": "Insurance Premiums", "budgeted_amount": 8500},
            {"name": "Utilities", "budgeted_amount": 6200},
            {"name": "Phone & Internet", "budgeted_amount": 4500},
            {"name": "Transportation", "budgeted_amount": 4000},
            {"name": "Children's Activities", "budgeted_amount": 4000}
        ]
    },
    
    "samuel": {
        "email": "samuel@example.com", 
        "password": "samuel12345",
        "goals": [
            {
                "name": "Retirement Fund",
                "target": 20000000,
                "current": 3200000,
                "target_date": "2035-08-22",
                "description": "Comprehensive retirement portfolio"
            },
            {
                "name": "Debt Freedom",
                "target": 1800000,
                "current": 0,
                "target_date": "2029-08-22",
                "description": "Clear all remaining debts"
            },
            {
                "name": "Legacy Planning",
                "target": 5000000,
                "current": 2400000,
                "target_date": "2035-08-22",
                "description": "Estate planning and trust setup"
            }
        ],
        "expense_categories": [
            {"name": "Food & Entertainment", "budgeted_amount": 25000},
            {"name": "Insurance Premiums", "budgeted_amount": 15000},
            {"name": "Mortgage (Rental Property)", "budgeted_amount": 12000},
            {"name": "Transportation", "budgeted_amount": 12000},
            {"name": "Travel", "budgeted_amount": 10000},
            {"name": "Property Management", "budgeted_amount": 8000},
            {"name": "Club Memberships", "budgeted_amount": 8000},
            {"name": "Utilities (Primary Home)", "budgeted_amount": 8000},
            {"name": "Healthcare", "budgeted_amount": 5000}
        ]
    },
    
    "emily": {
        "email": "emily@advisor.com",
        "password": "emily12345",
        "goals": [
            {
                "name": "Practice Growth",
                "target": 450000000,
                "current": 450000000,
                "target_date": "2027-11-28",
                "description": "Expand to 150 clients"
            },
            {
                "name": "Technology Investment", 
                "target": 500000,
                "current": 0,
                "target_date": "2025-11-28",
                "description": "Advanced planning software"
            },
            {
                "name": "Team Expansion",
                "target": 2400000,
                "current": 0,
                "target_date": "2026-11-28",
                "description": "Hire 2 junior advisors"
            }
        ],
        "expense_categories": [
            {"name": "Personal Living Expenses", "budgeted_amount": 25000},
            {"name": "Business Mortgage", "budgeted_amount": 18000},
            {"name": "Marketing & Development", "budgeted_amount": 15000},
            {"name": "Office Expenses", "budgeted_amount": 12000},
            {"name": "Professional Insurance", "budgeted_amount": 8000},
            {"name": "Technology & Software", "budgeted_amount": 6000},
            {"name": "Professional Development", "budgeted_amount": 5000},
            {"name": "Legal & Compliance", "budgeted_amount": 4000}
        ]
    }
}

def get_auth_token(email, password):
    """Get JWT token for authentication"""
    login_data = {
        "username": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login", data=login_data)
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"Login failed for {email}: {response.text}")
            return None
    except Exception as e:
        print(f"Login error for {email}: {str(e)}")
        return None

def add_goals(token, goals):
    """Add goals for a persona"""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    added_goals = []
    
    for goal in goals:
        try:
            response = requests.post(f"{API_BASE}/goals/", headers=headers, json=goal)
            if response.status_code == 201:
                goal_data = response.json()
                added_goals.append(goal_data)
                print(f"  ✅ Added goal: {goal['name']} (KES {goal['target']:,})")
            else:
                print(f"  ❌ Failed to add goal {goal['name']}: {response.text}")
        except Exception as e:
            print(f"  ❌ Error adding goal {goal['name']}: {str(e)}")
    
    return added_goals

def add_expense_categories(token, categories):
    """Add expense categories for a persona"""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    added_categories = []
    
    for category in categories:
        try:
            response = requests.post(f"{API_BASE}/expense-categories/", headers=headers, json=category)
            if response.status_code == 201:
                category_data = response.json() 
                added_categories.append(category_data)
                print(f"  ✅ Added expense: {category['name']} (KES {category['budgeted_amount']:,})")
            else:
                print(f"  ❌ Failed to add expense {category['name']}: {response.text}")
        except Exception as e:
            print(f"  ❌ Error adding expense {category['name']}: {str(e)}")
    
    return added_categories

def clear_existing_data(token):
    """Clear existing goals and expense categories"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Clear goals
    try:
        goals_response = requests.get(f"{API_BASE}/goals/", headers=headers)
        if goals_response.status_code == 200:
            goals = goals_response.json()
            for goal in goals:
                delete_response = requests.delete(f"{API_BASE}/goals/{goal['id']}", headers=headers)
                if delete_response.status_code == 200:
                    print(f"  🗑️ Cleared existing goal: {goal.get('name', 'Unknown')}")
    except Exception as e:
        print(f"  ⚠️ Error clearing goals: {str(e)}")
    
    # Clear expense categories
    try:
        expenses_response = requests.get(f"{API_BASE}/expense-categories/", headers=headers)
        if expenses_response.status_code == 200:
            expenses = expenses_response.json()
            for expense in expenses:
                delete_response = requests.delete(f"{API_BASE}/expense-categories/{expense['id']}", headers=headers)
                if delete_response.status_code == 200:
                    print(f"  🗑️ Cleared existing expense: {expense.get('name', 'Unknown')}")
    except Exception as e:
        print(f"  ⚠️ Error clearing expenses: {str(e)}")

def populate_persona_data(persona_key, persona_data):
    """Populate financial data for a single persona"""
    print(f"\n💰 Populating financial data for {persona_key.upper()}")
    print(f"📧 Email: {persona_data['email']}")
    
    # Get authentication token
    token = get_auth_token(persona_data['email'], persona_data['password'])
    if not token:
        print(f"❌ Failed to authenticate {persona_key}")
        return False
    
    # Clear existing data
    print("🧹 Clearing existing financial data...")
    clear_existing_data(token)
    
    # Add goals
    print(f"🎯 Adding {len(persona_data['goals'])} goals...")
    added_goals = add_goals(token, persona_data['goals'])
    
    # Add expense categories
    print(f"💳 Adding {len(persona_data['expense_categories'])} expense categories...")
    added_categories = add_expense_categories(token, persona_data['expense_categories'])
    
    # Summary
    total_goal_amount = sum(goal['target'] for goal in persona_data['goals'])
    total_expense_amount = sum(cat['budgeted_amount'] for cat in persona_data['expense_categories'])
    
    print(f"📊 Summary for {persona_key.upper()}:")
    print(f"  - Goals: {len(added_goals)}/{len(persona_data['goals'])} added (Total: KES {total_goal_amount:,})")
    print(f"  - Expenses: {len(added_categories)}/{len(persona_data['expense_categories'])} added (Monthly: KES {total_expense_amount:,})")
    
    return len(added_goals) == len(persona_data['goals']) and len(added_categories) == len(persona_data['expense_categories'])

def verify_persona_data(persona_key, persona_data):
    """Verify the data was added correctly"""
    print(f"\n✅ Verifying data for {persona_key.upper()}...")
    
    token = get_auth_token(persona_data['email'], persona_data['password'])
    if not token:
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Verify goals
    goals_response = requests.get(f"{API_BASE}/goals/", headers=headers)
    if goals_response.status_code == 200:
        goals = goals_response.json()
        print(f"  🎯 Goals: {len(goals)} found")
        for goal in goals:
            print(f"    - {goal.get('name', 'Unknown')}: KES {goal.get('target', 0):,}")
    
    # Verify expense categories  
    expenses_response = requests.get(f"{API_BASE}/expense-categories/", headers=headers)
    if expenses_response.status_code == 200:
        expenses = expenses_response.json()
        print(f"  💳 Expenses: {len(expenses)} found")
        for expense in expenses:
            print(f"    - {expense.get('name', 'Unknown')}: KES {expense.get('budgeted_amount', 0):,}")
    
    return True

if __name__ == "__main__":
    print("Populating Persona Financial Data from PERSONAS_SOURCE_OF_TRUTH.md")
    print("=" * 80)
    
    success_count = 0
    total_personas = len(PERSONA_FINANCIAL_DATA)
    
    # Populate all personas
    for persona_key, persona_data in PERSONA_FINANCIAL_DATA.items():
        success = populate_persona_data(persona_key, persona_data)
        if success:
            success_count += 1
        
        # Verify the data
        verify_persona_data(persona_key, persona_data)
    
    print("\n" + "=" * 80)
    print(f"📈 COMPLETION SUMMARY:")
    print(f"  - Personas Updated: {success_count}/{total_personas}")
    print(f"  - Success Rate: {(success_count/total_personas)*100:.1f}%")
    
    if success_count == total_personas:
        print("🎉 All personas successfully populated with comprehensive financial data!")
        print("📋 Ready for comprehensive testing with:")
        print("  - Emergency funds, debt payoff, investment goals")
        print("  - Detailed monthly expense tracking")
        print("  - Complete financial profiles per persona")
    else:
        print("⚠️ Some personas may need manual verification")
    
    print("\n📚 Next steps:")
    print("1. Run Cypress tests to validate UI shows new data")
    print("2. Test goal and expense CRUD operations")
    print("3. Verify data isolation between personas")
    print("\nDone! 🎯")