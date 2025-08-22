#!/usr/bin/env python3
"""
Simple Clean Architecture Test - ASCII Only
Tests our clean architecture components in isolation
"""

import sys
sys.path.append('.')

def test_domain_layer():
    """Test domain layer components"""
    print("Testing Domain Layer...")
    
    try:
        from app.domain.value_objects.money import Money
        from app.domain.value_objects.period import Period, PeriodType
        from app.domain.entities.budget import Budget, BudgetCategory
        from decimal import Decimal
        from datetime import date
        
        # Test Money
        money = Money(Decimal('100.50'))
        assert money.amount == Decimal('100.50')
        print("  Money value object working")
        
        # Test Period
        period = Period.monthly(2025, 3)
        assert period.start_date == date(2025, 3, 1)
        print("  Period value object working")
        
        # Test Budget Category
        category = BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('800.00')),
            spent_amount=Money(Decimal('600.00'))
        )
        variance = category.calculate_variance()
        assert variance.amount == Decimal('200.00')
        print("  BudgetCategory entity working")
        
        # Test Budget
        budget = Budget(
            user_id=1,
            period=period,
            monthly_income=Money(Decimal('5000.00'))
        )
        budget.add_category(category)
        
        total_expenses = budget.calculate_total_expenses()
        assert total_expenses.amount == Decimal('800.00')
        print("  Budget entity working")
        
        return True
        
    except Exception as e:
        print(f"  Domain layer test failed: {e}")
        return False

def test_application_layer():
    """Test application layer components"""
    print("Testing Application Layer...")
    
    try:
        from app.application.dto.budget_dto import BudgetOverviewDto, CreateBudgetCategoryRequest
        from decimal import Decimal
        
        # Test DTOs
        overview_dto = BudgetOverviewDto(
            monthly_income=Decimal('5000.00'),
            total_expenses=Decimal('3000.00'),
            total_goals=Decimal('1000.00'),
            surplus=Decimal('1000.00'),
            categories={},
            variance_by_category={},
            is_balanced=True,
            savings_rate=Decimal('20.00'),
            expense_ratio=Decimal('60.00'),
            period_start='2025-01-01',
            period_end='2025-01-31'
        )
        assert overview_dto.monthly_income == Decimal('5000.00')
        print("  BudgetOverviewDto working")
        
        return True
        
    except Exception as e:
        print(f"  Application layer test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Clean Architecture Simple Test Suite")
    print("====================================")
    
    tests = [test_domain_layer, test_application_layer]
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
            print("")
    
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("SUCCESS: All clean architecture components working!")
        print("Next: Start API server and run Cypress tests")
        return True
    else:
        print(f"FAILED: {total - passed} test(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)