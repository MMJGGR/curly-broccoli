#!/usr/bin/env python3
"""
Simple test of onboarding data flow - no emojis
"""

import psycopg2
import json

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'finance_app',
    'user': 'user', 
    'password': 'pass'
}

def test_richard_data():
    """Test Richard's onboarding data directly"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("TESTING RICHARD'S ONBOARDING DATA")
        print("=" * 50)
        
        # First, check what tables exist
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cursor.fetchall()
        print("Available tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Get Richard's user ID
        cursor.execute("SELECT id FROM users WHERE email = %s", ('richard.mmacharia@gmail.com',))
        user_result = cursor.fetchone()
        
        if not user_result:
            print("ERROR: Richard not found")
            return
            
        user_id = user_result[0]
        print(f"Found Richard with user_id: {user_id}")
        
        # Get his onboarding data
        cursor.execute("SELECT financial_data FROM onboarding_states WHERE user_id = %s", (user_id,))
        onboarding_result = cursor.fetchone()
        
        if not onboarding_result or not onboarding_result[0]:
            print("ERROR: No financial data found")
            return
            
        financial_data = onboarding_result[0]
        print(f"Financial data type: {type(financial_data)}")
        
        if isinstance(financial_data, str):
            fin_data = json.loads(financial_data)
        else:
            fin_data = financial_data
            
        print("FINANCIAL DATA:")
        print(f"  Monthly Income: {fin_data.get('monthlyIncome')}")
        print(f"  Rent: {fin_data.get('rent')}")
        print(f"  Utilities: {fin_data.get('utilities')}")
        print(f"  Groceries: {fin_data.get('groceries')}")
        print(f"  Transport: {fin_data.get('transport')}")
        print(f"  Loan Repayments: {fin_data.get('loanRepayments')}")
        print(f"  Custom Expenses: {len(fin_data.get('customExpenses', []))}")
        
        # Test expenses logic
        expenses_count = 0
        total_amount = 0
        
        # Standard expenses
        standard_expenses = [
            fin_data.get('rent', 0),
            fin_data.get('utilities', 0),
            fin_data.get('groceries', 0),
            fin_data.get('transport', 0),
            fin_data.get('loanRepayments', 0)
        ]
        
        for amount in standard_expenses:
            if amount and amount > 0:
                expenses_count += 1
                total_amount += amount
                
        # Custom expenses
        custom_expenses = fin_data.get('customExpenses', [])
        for custom in custom_expenses:
            if custom.get('amount', 0) > 0:
                expenses_count += 1
                total_amount += custom['amount']
        
        print("EXPECTED EXPENSES:")
        print(f"  Count: {expenses_count}")
        print(f"  Total: {total_amount}")
        
        if expenses_count > 0:
            print("SUCCESS: Expenses should be generated!")
        else:
            print("PROBLEM: No expenses would be generated")
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    test_richard_data()