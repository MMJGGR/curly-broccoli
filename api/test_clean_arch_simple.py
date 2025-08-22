#!/usr/bin/env python3
"""
Simple Clean Architecture Test
Tests our clean architecture components in isolation to verify they work
"""

import sys
import os
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
        assert str(money) == "KES 100.50"
        print("  Money value object working")
        
        # Test Period
        period = Period.monthly(2025, 3)
        assert period.start_date == date(2025, 3, 1)
        assert period.end_date == date(2025, 3, 31)
        print("  ✅ Period value object working")
        
        # Test Budget Category
        category = BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('800.00')),
            spent_amount=Money(Decimal('600.00'))
        )
        variance = category.calculate_variance()
        assert variance.amount == Decimal('200.00')
        print("  ✅ BudgetCategory entity working")
        
        # Test Budget
        budget = Budget(
            user_id=1,
            period=period,
            monthly_income=Money(Decimal('5000.00'))
        )
        budget.add_category(category)
        
        total_expenses = budget.calculate_total_expenses()
        assert total_expenses.amount == Decimal('800.00')
        print("  ✅ Budget entity working")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Domain layer test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_application_layer():
    """Test application layer components"""
    print("\n🎯 Testing Application Layer...")
    
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
        print("  ✅ BudgetOverviewDto working")
        
        # Test Request DTO
        request_dto = CreateBudgetCategoryRequest(
            user_id=1,
            category_name="Transport",
            allocated_amount=Decimal('500.00'),
            category_type="expense"
        )
        assert request_dto.category_name == "Transport"
        print("  ✅ CreateBudgetCategoryRequest working")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Application layer test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_use_cases_with_mock():
    """Test use cases with mock repository"""
    print("\n🔄 Testing Use Cases (with mock)...")
    
    try:
        from app.application.use_cases.get_budget_overview import GetBudgetOverview
        from app.domain.entities.budget import Budget, BudgetCategory
        from app.domain.value_objects.money import Money
        from app.domain.value_objects.period import Period
        from decimal import Decimal
        
        # Mock repository
        class MockBudgetRepository:
            def __init__(self):
                period = Period.monthly(2025, 3)
                budget = Budget(
                    user_id=1,
                    period=period,
                    monthly_income=Money(Decimal('5000.00'))
                )
                budget.add_category(BudgetCategory(
                    name="Groceries",
                    allocated_amount=Money(Decimal('800.00')),
                    spent_amount=Money(Decimal('600.00'))
                ))
                self.budget = budget
            
            async def get_by_user_id(self, user_id):
                return self.budget if user_id == 1 else None
        
        # Test use case
        import asyncio
        async def test_use_case():
            repo = MockBudgetRepository()
            use_case = GetBudgetOverview(repo)
            result = await use_case.execute(1)
            
            assert result is not None
            assert result.monthly_income == Decimal('5000.00')
            assert result.total_expenses == Decimal('800.00')
            return True
        
        success = asyncio.run(test_use_case())
        if success:
            print("  ✅ GetBudgetOverview use case working")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Use case test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_endpoint_structure():
    """Test that endpoints can be parsed (without importing dependencies)"""
    print("\n🌐 Testing Endpoint Structure...")
    
    try:
        # Read the endpoint file and check structure
        endpoint_file = 'app/api/v1/endpoints/budget_v2_clean.py'
        with open(endpoint_file, 'r') as f:
            content = f.read()
        
        # Check for required endpoint patterns
        required_patterns = [
            '@router.get("/overview")',
            '@router.post("/categories")',
            '@router.put("/categories/{category_name}/allocation")',
            '@router.put("/categories/{category_name}/spending")',
            '@router.get("/health")'
        ]
        
        for pattern in required_patterns:
            if pattern in content:
                print(f"  ✅ Found endpoint: {pattern}")
            else:
                print(f"  ❌ Missing endpoint: {pattern}")
                return False
        
        return True
        
    except Exception as e:
        print(f"  ❌ Endpoint structure test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Clean Architecture Simple Test Suite")
    print("=====================================")
    
    tests = [
        test_domain_layer,
        test_application_layer,
        test_use_cases_with_mock,
        test_endpoint_structure
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All clean architecture components are working correctly!")
        print("\n📋 Next Steps:")
        print("1. Start API server: python -m uvicorn app.main:app --reload")
        print("2. Test endpoints: curl http://localhost:8000/api/v1/budget-v2/health")
        print("3. Run Cypress tests: cd frontend && npm run test:clean-arch:open")
        return True
    else:
        print(f"❌ {total - passed} test(s) failed. Please fix issues before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)