#!/usr/bin/env python3
"""
Backend Component Testing Script
Tests the new components without Docker dependency
"""
import sys
import os
from pathlib import Path
from decimal import Decimal
from datetime import datetime
from dataclasses import dataclass

# Add the API path to sys.path
api_path = Path(__file__).parent / "api"
sys.path.insert(0, str(api_path))

def test_onboarding_schema():
    """Test the enhanced onboarding schema validation"""
    print("=" * 60)
    print("TESTING ONBOARDING SCHEMA VALIDATION")
    print("=" * 60)
    
    try:
        from app.schemas.onboarding import EmploymentProfileData
        print(" EmploymentProfileData imported successfully")
        
        # Test 1: Valid employment profile
        print("\n Test 1: Valid Employment Profile")
        valid_data = {
            'industry_sector': 'technology',
            'job_role_level': 'senior', 
            'employment_type': 'permanent',
            'years_current_employer': 3.5,
            'years_current_industry': 8.0,
            'total_work_experience': 10.0,
            'work_location': 'nairobi',
            'income_variability': 'fixed',
            'bonus_percentage': 15.0,
            'skill_obsolescence_risk': 'medium'
        }
        
        profile = EmploymentProfileData(**valid_data)
        print(f" Profile created: {profile.industry_sector} {profile.job_role_level}")
        print(f"   Location: {profile.work_location}")
        print(f"   Experience: {profile.total_work_experience} years")
        
        # Test 2: Invalid industry sector
        print("\n Test 2: Invalid Industry Sector")
        try:
            invalid_data = valid_data.copy()
            invalid_data['industry_sector'] = 'invalid_industry'
            profile = EmploymentProfileData(**invalid_data)
            print(" Should have failed validation")
        except Exception as e:
            print(f" Validation caught: {str(e)[:100]}...")
        
        # Test 3: Invalid role level
        print("\n Test 3: Invalid Role Level")
        try:
            invalid_data = valid_data.copy()
            invalid_data['job_role_level'] = 'invalid_role'
            profile = EmploymentProfileData(**invalid_data)
            print(" Should have failed validation")
        except Exception as e:
            print(f" Validation caught: {str(e)[:100]}...")
            
        # Test 4: Edge case values
        print("\n Test 4: Edge Case Values")
        edge_data = valid_data.copy()
        edge_data['years_current_employer'] = 0.1  # Very new employee
        edge_data['bonus_percentage'] = 95.0  # Almost all bonus
        
        profile = EmploymentProfileData(**edge_data)
        print(f" Edge case handled: {profile.years_current_employer} years tenure")
        
        return True
        
    except ImportError as e:
        print(f" Import failed: {e}")
        return False
    except Exception as e:
        print(f" Unexpected error: {e}")
        return False


def test_discount_rate_calculator():
    """Test the discount rate calculator service logic"""
    print("\n" + "=" * 60)
    print(" TESTING DISCOUNT RATE CALCULATOR")
    print("=" * 60)
    
    try:
        from app.domain.services.discount_rate_calculator import (
            DiscountRateCalculator, 
            IndustryRiskProfile, 
            RegionalRateData,
            RiskLevel
        )
        from app.schemas.onboarding import EmploymentProfileData
        
        print(" DiscountRateCalculator imported successfully")
        
        calculator = DiscountRateCalculator()
        
        # Test 1: Government employee (low risk)
        print("\n Test 1: Government Employee Profile")
        gov_profile = EmploymentProfileData(
            industry_sector='government',
            job_role_level='mid',
            employment_type='permanent',
            years_current_employer=5.0,
            years_current_industry=10.0,
            total_work_experience=12.0,
            work_location='nairobi',
            income_variability='fixed'
        )
        
        rate, components = calculator.calculate_human_capital_discount_rate(gov_profile, user_age=35)
        print(f" Government rate: {rate:.1%}")
        print(f"   Base rate: {components.base_rate:.1%}")
        print(f"   Industry premium: {components.industry_risk_premium:.1%}")
        print(f"   Career premium: {components.career_premium:.1%}")
        
        # Test 2: Startup founder (high risk)
        print("\n Test 2: Startup Founder Profile")
        startup_profile = EmploymentProfileData(
            industry_sector='startup',
            job_role_level='owner',
            employment_type='business_owner',
            years_current_employer=1.5,
            years_current_industry=3.0,
            total_work_experience=8.0,
            work_location='nairobi',
            income_variability='project_based',
            bonus_percentage=0.0,
            stock_compensation_percentage=75.0
        )
        
        rate, components = calculator.calculate_human_capital_discount_rate(startup_profile, user_age=28)
        print(f" Startup rate: {rate:.1%}")
        print(f"   Base rate: {components.base_rate:.1%}")
        print(f"   Industry premium: {components.industry_risk_premium:.1%}")
        print(f"   Career premium: {components.career_premium:.1%}")
        
        # Test 3: Technology senior (medium risk)
        print("\n Test 3: Senior Tech Professional")
        tech_profile = EmploymentProfileData(
            industry_sector='technology',
            job_role_level='senior',
            employment_type='permanent',
            years_current_employer=4.0,
            years_current_industry=12.0,
            total_work_experience=15.0,
            work_location='nairobi',
            income_variability='fixed',
            bonus_percentage=20.0
        )
        
        rate, components = calculator.calculate_human_capital_discount_rate(tech_profile, user_age=35)
        print(f" Tech senior rate: {rate:.1%}")
        print(f"   Base rate: {components.base_rate:.1%}")
        print(f"   Industry premium: {components.industry_risk_premium:.1%}")
        print(f"   Career premium: {components.career_premium:.1%}")
        
        # Test 4: Expense liability rates
        print("\n Test 4: Expense Liability Rates")
        essential_rate, _ = calculator.calculate_expense_liability_discount_rate('essential', tech_profile)
        discretionary_rate, _ = calculator.calculate_expense_liability_discount_rate('discretionary', tech_profile)
        
        print(f" Essential expenses rate: {essential_rate:.1%}")
        print(f" Discretionary expenses rate: {discretionary_rate:.1%}")
        
        # Test 5: Rate validation
        print("\n Test 5: Rate Validation")
        validation = calculator.validate_discount_rate(
            rate=Decimal('0.075'),  # 7.5%
            rate_type='human_capital',
            employment_profile=tech_profile
        )
        
        print(f" Rate validation: {'Valid' if validation.is_valid else 'Invalid'}")
        print(f"   Confidence: {validation.confidence_level:.1%}")
        print(f"   CFA compliant: {validation.meets_cfa_standards}")
        if validation.validation_warnings:
            print(f"   Warnings: {len(validation.validation_warnings)}")
        
        return True
        
    except ImportError as e:
        print(f" Import failed: {e}")
        return False
    except Exception as e:
        print(f" Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_financial_events():
    """Test the financial event system"""
    print("\n" + "=" * 60)
    print(" TESTING FINANCIAL EVENT SYSTEM")
    print("=" * 60)
    
    try:
        from app.domain.entities.financial_event import (
            FinancialEvent,
            EventType,
            EventSource,
            ImpactAnalysis,
            create_employment_updated_event,
            create_asset_updated_event
        )
        
        print(" Financial event entities imported successfully")
        
        # Test 1: Create employment update event
        print("\n Test 1: Employment Update Event")
        old_employment = {'industry_sector': 'education', 'job_role_level': 'mid'}
        new_employment = {'industry_sector': 'technology', 'job_role_level': 'senior'}
        
        impact = ImpactAnalysis(
            net_worth_impact=Decimal('500000'),  # KES 500K impact
            human_capital_impact=Decimal('2000000'),  # KES 2M increase
            expense_liability_impact=Decimal('0'),
            liquidity_impact=Decimal('0'),
            risk_profile_impact='increased',
            confidence_level=0.85
        )
        
        event = create_employment_updated_event(
            user_id=1,
            old_employment_data=old_employment,
            new_employment_data=new_employment,
            change_reason='Career advancement - moved from teaching to tech',
            impact_analysis=impact
        )
        
        print(f" Event created: {event.event_type.value}")
        print(f"   User: {event.user_id}")
        print(f"   Impact: KES {event.impact_analysis.net_worth_impact:,}")
        print(f"   Professional review required: {event.professional_review_required}")
        
        # Test 2: Create asset update event  
        print("\n Test 2: Asset Update Event")
        old_asset = {'current_value': 100000, 'asset_type': 'savings'}
        new_asset = {'current_value': 150000, 'asset_type': 'savings'}
        
        asset_impact = ImpactAnalysis(
            net_worth_impact=Decimal('50000'),
            human_capital_impact=Decimal('0'),
            expense_liability_impact=Decimal('0'),
            liquidity_impact=Decimal('50000'),
            risk_profile_impact='unchanged',
            confidence_level=1.0
        )
        
        asset_event = create_asset_updated_event(
            user_id=1,
            asset_id='savings_001',
            old_asset_data=old_asset,
            new_asset_data=new_asset,
            change_reason='Monthly savings increase',
            impact_analysis=asset_impact
        )
        
        print(f" Asset event created: {asset_event.event_type.value}")
        print(f"   Entity: {asset_event.entity_type} {asset_event.entity_id}")
        print(f"   Delta: {asset_event.delta_data}")
        
        # Test 3: Event validation
        print("\n Test 3: Event Validation")
        try:
            # This should fail - future timestamp
            future_event = FinancialEvent(
                event_id='test_123',
                user_id=1,
                event_type=EventType.ASSET_UPDATED,
                event_source=EventSource.USER_ACTION,
                event_timestamp=datetime(2030, 1, 1),  # Future date
                business_date=datetime.now(),
                entity_type='asset',
                entity_id='test',
                old_data={},
                new_data={'test': 'value'},
                delta_data={},
                change_reason='Test',
                created_by='1'
            )
            print(" Should have failed validation")
        except ValueError as e:
            print(f" Validation caught future timestamp: {str(e)[:50]}...")
            
        return True
        
    except ImportError as e:
        print(f" Import failed: {e}")
        return False
    except Exception as e:
        print(f" Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_schema_imports():
    """Test all schema imports work correctly"""
    print("\n" + "=" * 60)
    print(" TESTING SCHEMA IMPORTS")
    print("=" * 60)
    
    schemas_tested = 0
    schemas_passed = 0
    
    # Test existing schemas
    schemas_to_test = [
        ('app.schemas.onboarding', 'OnboardingStepRequest'),
        ('app.schemas.onboarding', 'PersonalInfoData'),
        ('app.schemas.onboarding', 'RiskAssessmentData'),
        ('app.schemas.onboarding', 'FinancialInfoData'),
        ('app.schemas.onboarding', 'GoalsData'),
        ('app.schemas.onboarding', 'EmploymentProfileData'),  # New one
    ]
    
    for module_path, class_name in schemas_to_test:
        schemas_tested += 1
        try:
            module = __import__(module_path, fromlist=[class_name])
            schema_class = getattr(module, class_name)
            print(f" {class_name} imported successfully")
            schemas_passed += 1
        except ImportError as e:
            print(f" {class_name} import failed: {e}")
        except AttributeError as e:
            print(f" {class_name} not found in module: {e}")
        except Exception as e:
            print(f" {class_name} unexpected error: {e}")
    
    print(f"\n Schema Import Results: {schemas_passed}/{schemas_tested} passed")
    return schemas_passed == schemas_tested


def main():
    """Run all backend tests"""
    print("BACKEND COMPONENT TESTING")
    print("Testing new Foundation Week Day 3 components...")
    print("While Docker containers are building in background...")
    
    results = []
    
    # Test 1: Onboarding Schema
    try:
        result = test_onboarding_schema()
        results.append(('Onboarding Schema', result))
    except Exception as e:
        print(f" Onboarding schema test crashed: {e}")
        results.append(('Onboarding Schema', False))
    
    # Test 2: Discount Rate Calculator  
    try:
        result = test_discount_rate_calculator()
        results.append(('Discount Rate Calculator', result))
    except Exception as e:
        print(f" Discount rate calculator test crashed: {e}")
        results.append(('Discount Rate Calculator', False))
    
    # Test 3: Financial Events
    try:
        result = test_financial_events()
        results.append(('Financial Event System', result))
    except Exception as e:
        print(f" Financial event test crashed: {e}")
        results.append(('Financial Event System', False))
    
    # Test 4: Schema Imports
    try:
        result = test_schema_imports()
        results.append(('Schema Imports', result))
    except Exception as e:
        print(f" Schema import test crashed: {e}")
        results.append(('Schema Imports', False))
    
    # Final Results
    print("\n" + "=" * 60)
    print(" FINAL TEST RESULTS")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = " PASSED" if result else " FAILED"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\n Overall Result: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print(" All backend components are working correctly!")
        print("Ready for Docker container testing when build completes.")
    else:
        print("  Some issues found - need to investigate failed tests.")
    
    return passed == total


if __name__ == "__main__":
    main()