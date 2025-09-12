#!/usr/bin/env python3
"""
Direct database test of onboarding data flow
Tests expenses data retrieval outside of containers
"""

import sys
import os
sys.path.append('api')

import psycopg2
import json
from datetime import datetime

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'main_db',
    'user': 'postgres', 
    'password': 'password123'
}

def get_db_connection():
    """Get direct database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}")
        return None

def test_user_onboarding_data(email):
    """Test onboarding data retrieval for a specific user"""
    conn = get_db_connection()
    if not conn:
        return None
        
    try:
        cursor = conn.cursor()
        
        # Get user ID
        cursor.execute("SELECT id, email FROM users WHERE email = %s", (email,))
        user_result = cursor.fetchone()
        
        if not user_result:
            print(f"❌ User {email} not found")
            return None
            
        user_id, user_email = user_result
        print(f"👤 Found user: {user_email} (ID: {user_id})")
        
        # Get onboarding state
        cursor.execute("""
            SELECT 
                current_step, 
                completed_steps, 
                is_complete,
                personal_data,
                risk_data, 
                financial_data,
                goals_data,
                employment_data
            FROM onboarding_state 
            WHERE user_id = %s
        """, (user_id,))
        
        onboarding_result = cursor.fetchone()
        
        if not onboarding_result:
            print(f"❌ No onboarding data found for user {user_id}")
            return None
            
        current_step, completed_steps, is_complete, personal_data, risk_data, financial_data, goals_data, employment_data = onboarding_result
        
        print(f"\n📋 ONBOARDING STATE:")
        print(f"   Current step: {current_step}")
        print(f"   Completed steps: {completed_steps}")
        print(f"   Is complete: {is_complete}")
        print(f"   Has personal_data: {personal_data is not None}")
        print(f"   Has risk_data: {risk_data is not None}")
        print(f"   Has financial_data: {financial_data is not None}")
        print(f"   Has goals_data: {goals_data is not None}")
        print(f"   Has employment_data: {employment_data is not None}")
        
        # Parse financial data if it exists
        if financial_data:
            print(f"\n💰 FINANCIAL DATA:")
            if isinstance(financial_data, str):
                fin_data = json.loads(financial_data)
            else:
                fin_data = financial_data
                
            print(f"   Monthly Income: {fin_data.get('monthlyIncome', 'N/A')}")
            print(f"   Rent: {fin_data.get('rent', 'N/A')}")
            print(f"   Utilities: {fin_data.get('utilities', 'N/A')}")
            print(f"   Groceries: {fin_data.get('groceries', 'N/A')}")
            print(f"   Transport: {fin_data.get('transport', 'N/A')}")
            print(f"   Loan Repayments: {fin_data.get('loanRepayments', 'N/A')}")
            
            custom_expenses = fin_data.get('customExpenses', [])
            print(f"   Custom Expenses: {len(custom_expenses)} items")
            for i, exp in enumerate(custom_expenses):
                print(f"     {i+1}. {exp.get('name', 'Unnamed')}: {exp.get('amount', 0)}")
                
            custom_incomes = fin_data.get('customIncomes', [])
            print(f"   Custom Incomes: {len(custom_incomes)} items")
            for i, inc in enumerate(custom_incomes):
                print(f"     {i+1}. {inc.get('name', 'Unnamed')}: {inc.get('amount', 0)}")
        
        return {
            'user_id': user_id,
            'user_email': user_email,
            'onboarding_complete': is_complete,
            'completed_steps': completed_steps,
            'financial_data': financial_data
        }
        
    except Exception as e:
        print(f"❌ Error retrieving onboarding data: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def simulate_expenses_logic(user_data):
    """Simulate the expenses onboarding integration logic"""
    if not user_data or not user_data['financial_data']:
        print("❌ No financial data to process")
        return []
        
    print(f"\n🔧 SIMULATING EXPENSES LOGIC:")
    financial_data = user_data['financial_data']
    
    if isinstance(financial_data, str):
        financial_data = json.loads(financial_data)
    
    onboarding_expenses = []
    
    # Convert standard expense categories from onboarding
    standard_expenses = [
        {"name": "Rent", "amount": financial_data.get('rent', 0), "type": "housing"},
        {"name": "Utilities", "amount": financial_data.get('utilities', 0), "type": "utilities"}, 
        {"name": "Groceries", "amount": financial_data.get('groceries', 0), "type": "food_dining"},
        {"name": "Transport", "amount": financial_data.get('transport', 0), "type": "transportation"},
        {"name": "Loan Repayments", "amount": financial_data.get('loanRepayments', 0), "type": "debt_payment"}
    ]
    
    print(f"   Processing {len(standard_expenses)} standard expense categories...")
    
    for expense in standard_expenses:
        if expense["amount"] > 0:
            expense_item = {
                "id": f"onboarding-{expense['type']}",
                "description": f"{expense['name']} (from onboarding)",
                "amount": float(expense["amount"]),
                "expense_type": expense["type"],
                "expense_category": "fixed_expenses" if expense["type"] in ["housing", "debt_payment"] else "variable_expenses",
                "is_recurring": True,
                "frequency_months": 1,
                "annual_projection": float(expense["amount"]) * 12,
                "monthly_equivalent": float(expense["amount"]),
                "is_essential": True,
                "source": "onboarding"
            }
            onboarding_expenses.append(expense_item)
            print(f"     ✅ Added: {expense['name']} - {expense['amount']}")
    
    # Add custom expenses from onboarding
    custom_expenses = financial_data.get('customExpenses', [])
    print(f"   Processing {len(custom_expenses)} custom expenses...")
    
    for custom_expense in custom_expenses:
        expense_item = {
            "id": f"onboarding-custom-{custom_expense.get('id', 0)}",
            "description": f"{custom_expense.get('name', 'Custom Expense')} (from onboarding)",
            "amount": float(custom_expense.get('amount', 0)),
            "expense_type": "other",
            "expense_category": "discretionary_expenses",
            "is_recurring": True,
            "frequency_months": 1,
            "annual_projection": float(custom_expense.get('amount', 0)) * 12,
            "monthly_equivalent": float(custom_expense.get('amount', 0)),
            "is_essential": False,
            "source": "onboarding"
        }
        onboarding_expenses.append(expense_item)
        print(f"     ✅ Added: {custom_expense.get('name', 'Unnamed')} - {custom_expense.get('amount', 0)}")
    
    total_amount = sum(exp["amount"] for exp in onboarding_expenses)
    
    print(f"\n📊 EXPENSES SUMMARY:")
    print(f"   Total expenses: {len(onboarding_expenses)}")
    print(f"   Total amount: {total_amount}")
    
    return onboarding_expenses

def main():
    """Main test function"""
    print("DIRECT ONBOARDING DATA FLOW TEST")
    print("=" * 60)
    
    # Test users
    test_users = [
        'richard.mmacharia@gmail.com',
        'jamal@example.com'
    ]
    
    for email in test_users:
        print(f"\n🚀 Testing user: {email}")
        print("-" * 50)
        
        # Get onboarding data
        user_data = test_user_onboarding_data(email)
        
        if user_data:
            # Simulate expenses processing
            expenses = simulate_expenses_logic(user_data)
            
            print(f"\n✅ RESULT FOR {email}:")
            print(f"   Onboarding complete: {user_data['onboarding_complete']}")
            print(f"   Steps completed: {user_data['completed_steps']}")
            print(f"   Expenses generated: {len(expenses)}")
            
            if len(expenses) > 0:
                print(f"   🎉 SUCCESS: Expenses should appear in API!")
            else:
                print(f"   ⚠️  WARNING: No expenses generated")
        else:
            print(f"   ❌ FAILED: Could not retrieve user data")
    
    print(f"\n🎯 CONCLUSION:")
    print("If expenses are generated here but not in the API,")
    print("the issue is in the container/endpoint loading.")

if __name__ == "__main__":
    main()