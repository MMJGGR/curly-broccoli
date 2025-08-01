#!/usr/bin/env python3
"""
Populate personas with comprehensive financial data
Based on PERSONAS_SOURCE_OF_TRUTH.md
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
                "target": "120000",
                "current": "25000",
                "progress": 20.8,
                "target_date": "2026-02-01"
            },
            {
                "name": "Student Loan Payoff", 
                "target": "180000",
                "current": "0",
                "progress": 0.0,
                "target_date": "2027-08-01"
            },
            {
                "name": "First Investment",
                "target": "50000",
                "current": "0",
                "progress": 0.0,
                "target_date": "2025-02-01"
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
                print(f"  SUCCESS: Added goal: {goal['name']} (KES {goal['target']:,})")
            else:
                print(f"  FAILED: Goal {goal['name']}: {response.text}")
        except Exception as e:
            print(f"  ERROR: Goal {goal['name']}: {str(e)}")
    
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
                print(f"  SUCCESS: Added expense: {category['name']} (KES {category['budgeted_amount']:,})")
            else:
                print(f"  FAILED: Expense {category['name']}: {response.text}")
        except Exception as e:
            print(f"  ERROR: Expense {category['name']}: {str(e)}")
    
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
                    print(f"  CLEARED: Existing goal: {goal.get('name', 'Unknown')}")
    except Exception as e:
        print(f"  WARNING: Error clearing goals: {str(e)}")
    
    # Clear expense categories
    try:
        expenses_response = requests.get(f"{API_BASE}/expense-categories/", headers=headers)
        if expenses_response.status_code == 200:
            expenses = expenses_response.json()
            for expense in expenses:
                delete_response = requests.delete(f"{API_BASE}/expense-categories/{expense['id']}", headers=headers)
                if delete_response.status_code == 200:
                    print(f"  CLEARED: Existing expense: {expense.get('name', 'Unknown')}")
    except Exception as e:
        print(f"  WARNING: Error clearing expenses: {str(e)}")

if __name__ == "__main__":
    print("Populating Jamal with comprehensive financial data...")
    print("=" * 60)
    
    persona_data = PERSONA_FINANCIAL_DATA["jamal"]
    print(f"Email: {persona_data['email']}")
    
    # Get authentication token
    token = get_auth_token(persona_data['email'], persona_data['password'])
    if not token:
        print("FAILED: Could not authenticate")
        exit(1)
    
    # Clear existing data
    print("Clearing existing financial data...")
    clear_existing_data(token)
    
    # Add goals
    print(f"Adding {len(persona_data['goals'])} goals...")
    added_goals = add_goals(token, persona_data['goals'])
    
    # Add expense categories
    print(f"Adding {len(persona_data['expense_categories'])} expense categories...")
    added_categories = add_expense_categories(token, persona_data['expense_categories'])
    
    # Summary
    total_goal_amount = sum(int(goal['target']) for goal in persona_data['goals'])
    total_expense_amount = sum(cat['budgeted_amount'] for cat in persona_data['expense_categories'])
    
    print("=" * 60)
    print("SUMMARY:")
    print(f"  - Goals: {len(added_goals)}/{len(persona_data['goals'])} added")
    print(f"  - Total goal amount: KES {total_goal_amount:,}")
    print(f"  - Expenses: {len(added_categories)}/{len(persona_data['expense_categories'])} added")
    print(f"  - Monthly expenses: KES {total_expense_amount:,}")
    
    success = len(added_goals) == len(persona_data['goals']) and len(added_categories) == len(persona_data['expense_categories'])
    
    if success:
        print("SUCCESS: Jamal populated with comprehensive financial data!")
    else:
        print("WARNING: Some data may not have been added correctly")
    
    print("Done!")