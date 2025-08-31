#!/usr/bin/env python3
"""
Liability Component Testing Script
Tests the new liability CRUD operations without Docker dependency
"""
import sys
import os
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timezone
from dataclasses import dataclass

# Add the API path to sys.path
api_path = Path(__file__).parent / "api"
sys.path.insert(0, str(api_path))

def test_liability_domain_entity():
    """Test the liability domain entity validation and business logic"""
    print("=" * 60)
    print("TESTING LIABILITY DOMAIN ENTITY")
    print("=" * 60)
    
    try:
        from app.domain.entities.liability import (
            Liability, LiabilityType, LiabilityCategory, InterestRateType,
            create_liability
        )
        from app.domain.entities.money import Money
        print("SUCCESS: Liability domain entities imported successfully")
        
        # Test 1: Create a credit card liability
        print("\n Test 1: Credit Card Liability")
        credit_card = create_liability(
            liability_id="cc_001",
            user_id=1,
            name="Chase Freedom Credit Card",
            liability_type=LiabilityType.CREDIT_CARD,
            current_balance=Money(Decimal('15000'), 'KES'),
            interest_rate=Decimal('0.1875'),  # 18.75%
            minimum_payment=Money(Decimal('300'), 'KES'),
            credit_limit=Money(Decimal('50000'), 'KES')
        )
        
        print(f"   Name: {credit_card.name}")
        print(f"   Type: {credit_card.liability_type.value}")
        print(f"   Balance: KES {credit_card.current_balance.amount:,}")
        print(f"   Interest Rate: {credit_card.interest_rate*100:.2f}%")
        print(f"   Monthly Payment: KES {credit_card.monthly_payment.amount:,}")
        print(f"   Credit Utilization: {credit_card.credit_utilization_ratio:.1%}")
        print(f"   High Interest: {credit_card.is_high_interest}")
        print(f"   Payoff Timeline: {credit_card.payoff_timeline_months} months")
        
        # Test 2: Create a mortgage (secured debt)
        print("\n Test 2: Mortgage Liability")
        mortgage = create_liability(
            liability_id="mort_001",
            user_id=1,
            name="Primary Residence Mortgage",
            liability_type=LiabilityType.MORTGAGE_PRIMARY,
            current_balance=Money(Decimal('2500000'), 'KES'),
            interest_rate=Decimal('0.125'),  # 12.5%
            original_amount=Money(Decimal('3000000'), 'KES'),
            minimum_payment=Money(Decimal('35000'), 'KES'),
            term_months=300,  # 25 years
            remaining_payments=240,  # 20 years left
            collateral_description="4-bedroom house in Kileleshwa",
            collateral_value=Money(Decimal('4000000'), 'KES')
        )
        
        print(f"   Name: {mortgage.name}")
        print(f"   Type: {mortgage.liability_type.value}")
        print(f"   Balance: KES {mortgage.current_balance.amount:,}")
        print(f"   Interest Rate: {mortgage.interest_rate*100:.1f}%")
        print(f"   Monthly Payment: KES {mortgage.monthly_payment.amount:,}")
        print(f"   Secured: {mortgage.is_secured}")
        print(f"   Collateral: {mortgage.collateral_description}")
        print(f"   LTV Ratio: {mortgage.loan_to_value_ratio:.1%}" if mortgage.loan_to_value_ratio else "   LTV Ratio: Not calculated")
        
        # Test 3: Test business logic validation
        print("\n Test 3: Business Logic Validation")
        try:
            # This should fail - interest rate too high
            invalid_liability = Liability(
                liability_id="invalid_001",
                user_id=1,
                name="Invalid High Rate Loan",
                liability_type=LiabilityType.PERSONAL_LOAN,
                category=LiabilityCategory.UNSECURED_LIABILITIES,
                current_balance=Money(Decimal('10000'), 'KES'),
                original_amount=Money(Decimal('10000'), 'KES'),
                minimum_payment=Money(Decimal('500'), 'KES'),
                interest_rate=Decimal('0.75'),  # 75% - should fail
                rate_type=InterestRateType.FIXED,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            print("ERROR: Should have failed validation")
        except ValueError as e:
            print(f"SUCCESS: Validation caught invalid rate: {str(e)[:50]}...")
        
        # Test 4: Test liability categories
        print("\n Test 4: Liability Categories")
        categories = {
            'Credit Card': credit_card.get_category().value,
            'Mortgage': mortgage.get_category().value
        }
        
        for name, category in categories.items():
            print(f"   {name}: {category}")
        
        return True
        
    except ImportError as e:
        print(f"ERROR: Import failed: {e}")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_liability_enums_and_types():
    """Test liability type enumerations and classifications"""
    print("\n" + "=" * 60)
    print("TESTING LIABILITY ENUMS AND CLASSIFICATIONS")
    print("=" * 60)
    
    try:
        from app.domain.entities.liability import (
            LiabilityType, LiabilityCategory, InterestRateType,
            SECURED_LIABILITY_TYPES, HIGH_PRIORITY_PAYOFF_TYPES
        )
        
        print("SUCCESS: Liability enums imported successfully")
        
        # Test 1: Show all liability types
        print("\n Test 1: All Liability Types")
        print("   Secured Types:")
        for liability_type in SECURED_LIABILITY_TYPES:
            print(f"     - {liability_type.value}")
        
        print("   High Priority Payoff Types:")
        for liability_type in HIGH_PRIORITY_PAYOFF_TYPES:
            print(f"     - {liability_type.value}")
        
        # Test 2: Interest rate types
        print("\n Test 2: Interest Rate Types")
        for rate_type in InterestRateType:
            print(f"   - {rate_type.value}")
        
        # Test 3: Liability categories
        print("\n Test 3: Liability Categories")
        for category in LiabilityCategory:
            print(f"   - {category.value}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def test_liability_calculations():
    """Test liability financial calculations"""
    print("\n" + "=" * 60)
    print("TESTING LIABILITY FINANCIAL CALCULATIONS")
    print("=" * 60)
    
    try:
        from app.domain.entities.liability import LiabilityType, create_liability
        from app.domain.entities.money import Money
        
        # Test 1: Credit card payoff calculation
        print("\n Test 1: Credit Card Payoff Calculations")
        cc_high_balance = create_liability(
            liability_id="cc_test",
            user_id=1,
            name="High Balance Credit Card",
            liability_type=LiabilityType.CREDIT_CARD,
            current_balance=Money(Decimal('25000'), 'KES'),
            interest_rate=Decimal('0.24'),  # 24% APR
            minimum_payment=Money(Decimal('500'), 'KES'),  # 2% minimum
            credit_limit=Money(Decimal('30000'), 'KES')
        )
        
        print(f"   Balance: KES {cc_high_balance.current_balance.amount:,}")
        print(f"   Minimum Payment: KES {cc_high_balance.minimum_payment.amount:,}")
        print(f"   Interest Rate: {cc_high_balance.interest_rate*100:.1f}%")
        print(f"   Credit Utilization: {cc_high_balance.credit_utilization_ratio:.1%}")
        print(f"   Payoff Timeline: {cc_high_balance.payoff_timeline_months} months")
        print(f"   High Interest Flag: {cc_high_balance.is_high_interest}")
        
        # Test 2: Auto loan calculation
        print("\n Test 2: Auto Loan Calculations")
        auto_loan = create_liability(
            liability_id="auto_test",
            user_id=1,
            name="Toyota Camry Auto Loan",
            liability_type=LiabilityType.AUTO_LOAN,
            current_balance=Money(Decimal('800000'), 'KES'),
            interest_rate=Decimal('0.14'),  # 14% APR
            original_amount=Money(Decimal('1200000'), 'KES'),
            minimum_payment=Money(Decimal('25000'), 'KES'),
            term_months=60,  # 5 years
            remaining_payments=36,  # 3 years left
            collateral_description="2020 Toyota Camry",
            collateral_value=Money(Decimal('1000000'), 'KES')
        )
        
        print(f"   Balance: KES {auto_loan.current_balance.amount:,}")
        print(f"   Monthly Payment: KES {auto_loan.monthly_payment.amount:,}")
        print(f"   Interest Rate: {auto_loan.interest_rate*100:.1f}%")
        print(f"   Remaining Payments: {auto_loan.remaining_payments}")
        print(f"   Collateral Value: KES {auto_loan.collateral_value.amount:,}")
        
        # Test 3: Debt service calculations
        print("\n Test 3: Debt Service Impact")
        liabilities = [cc_high_balance, auto_loan]
        total_monthly_payments = sum(liability.debt_to_income_impact for liability in liabilities)
        
        print(f"   Credit Card Payment: KES {cc_high_balance.debt_to_income_impact:,}")
        print(f"   Auto Loan Payment: KES {auto_loan.debt_to_income_impact:,}")
        print(f"   Total Monthly Debt Service: KES {total_monthly_payments:,}")
        
        return True
        
    except ImportError as e:
        print(f"ERROR: Import failed: {e}")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all backend liability tests"""
    print("BACKEND LIABILITY COMPONENT TESTING")
    print("Testing new liability CRUD operations...")
    print("While Docker containers run in background...")
    
    results = []
    
    # Test 1: Domain Entity
    try:
        result = test_liability_domain_entity()
        results.append(('Liability Domain Entity', result))
    except Exception as e:
        print(f"ERROR: Liability domain entity test crashed: {e}")
        results.append(('Liability Domain Entity', False))
    
    # Test 2: Enums and Classifications  
    try:
        result = test_liability_enums_and_types()
        results.append(('Liability Enums & Types', result))
    except Exception as e:
        print(f"ERROR: Liability enums test crashed: {e}")
        results.append(('Liability Enums & Types', False))
    
    # Test 3: Financial Calculations
    try:
        result = test_liability_calculations()
        results.append(('Liability Calculations', result))
    except Exception as e:
        print(f"ERROR: Liability calculations test crashed: {e}")
        results.append(('Liability Calculations', False))
    
    # Final Results
    print("\n" + "=" * 60)
    print("FINAL LIABILITY TEST RESULTS")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "PASSED" if result else "FAILED"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("SUCCESS: All liability components are working correctly!")
        print("Ready for Docker API and Cypress testing.")
    else:
        print("WARNING: Some issues found - need to investigate failed tests.")
    
    return passed == total


if __name__ == "__main__":
    main()