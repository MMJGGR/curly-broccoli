"""
Get Financial Timeline Use Case - Clean Architecture
CFA-compliant financial timeline with life events and projections
"""
from typing import Dict, Any, List, Optional
from datetime import date, datetime
from decimal import Decimal
from dataclasses import asdict

from ...domain.entities.money import Money
from ...domain.entities.profile import UserProfile as Profile
from ...domain.repositories.profile_repository import ProfileRepository
from ...domain.repositories.asset_repository import AssetRepository
from ...domain.repositories.income_repository import IncomeRepository
from ...domain.repositories.expense_repository import ExpenseRepository


class GetFinancialTimeline:
    """Use case for generating comprehensive financial timeline and projections"""
    
    def __init__(
        self, 
        profile_repository: ProfileRepository,
        asset_repository: AssetRepository,
        income_repository: IncomeRepository,
        expense_repository: ExpenseRepository
    ):
        self._profile_repository = profile_repository
        self._asset_repository = asset_repository
        self._income_repository = income_repository
        self._expense_repository = expense_repository
    
    async def execute(
        self,
        user_id: int,
        projection_years: int = 40
    ) -> Dict[str, Any]:
        """
        Execute financial timeline generation with life events and projections
        
        Args:
            user_id: User identifier
            projection_years: Number of years to project
            
        Returns:
            Dict containing timeline data and projections
        """
        # Get user profile
        profile = await self._profile_repository.get_by_user_id(user_id)
        if not profile:
            raise ValueError("User profile not found")
        
        # Get current financial position
        assets = await self._asset_repository.get_by_user_id(user_id)
        incomes = await self._income_repository.get_by_user_id(user_id)
        expenses = await self._expense_repository.get_by_user_id(user_id)
        
        # Calculate current position
        current_position = self._calculate_current_position(assets, incomes, expenses)
        
        # Generate life events timeline
        life_events = self._generate_life_events(profile, projection_years)
        
        # Generate financial projections
        projections = self._generate_projections(
            current_position, incomes, expenses, profile, projection_years
        )
        
        # Generate milestone analysis
        milestones = self._generate_milestones(projections, life_events)
        
        return {
            "profile": {
                "age": profile.age,
                "employment_status": profile.employment_status,
                "risk_tolerance": profile.risk_tolerance,
                "retirement_age": profile.retirement_age or 65,
                "life_expectancy": profile.life_expectancy or 80
            },
            "current_position": current_position,
            "life_events": life_events,
            "projections": projections,
            "milestones": milestones,
            "timeline_metadata": {
                "projection_years": projection_years,
                "generated_at": datetime.now().isoformat(),
                "base_year": date.today().year
            }
        }
    
    def _calculate_current_position(self, assets, incomes, expenses) -> Dict[str, Any]:
        """Calculate current financial position"""
        total_assets = sum(asset.current_value.amount for asset in assets)
        monthly_income = sum(income.calculate_monthly_amount().amount for income in incomes)
        monthly_expenses = sum(expense.calculate_monthly_amount().amount for expense in expenses)
        
        return {
            "net_worth": {
                "amount": str(total_assets),
                "currency": "KES"
            },
            "monthly_income": {
                "amount": str(monthly_income),
                "currency": "KES"
            },
            "monthly_expenses": {
                "amount": str(monthly_expenses),
                "currency": "KES"
            },
            "monthly_surplus": {
                "amount": str(monthly_income - monthly_expenses),
                "currency": "KES"
            },
            "savings_rate": float((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        }
    
    def _generate_life_events(self, profile: Profile, projection_years: int) -> List[Dict[str, Any]]:
        """Generate life events timeline based on user profile"""
        events = []
        current_year = date.today().year
        current_age = profile.age
        
        # Career milestones
        if current_age < 30:
            events.append({
                "year": current_year + (30 - current_age),
                "age": 30,
                "event_type": "career_milestone",
                "title": "Career Establishment",
                "description": "Typical peak earning potential begins",
                "financial_impact": "income_increase"
            })
        
        if current_age < 35:
            events.append({
                "year": current_year + (35 - current_age),
                "age": 35,
                "event_type": "life_milestone",
                "title": "Peak Family Building Years",
                "description": "Potential major life changes and increased expenses",
                "financial_impact": "expense_increase"
            })
        
        # Retirement planning
        retirement_age = profile.retirement_age or 65
        if current_age < retirement_age:
            events.append({
                "year": current_year + (retirement_age - current_age),
                "age": retirement_age,
                "event_type": "retirement",
                "title": "Planned Retirement",
                "description": f"Transition from earning to withdrawal phase at age {retirement_age}",
                "financial_impact": "income_cessation"
            })
        
        # Healthcare considerations
        if current_age < 50:
            events.append({
                "year": current_year + (50 - current_age),
                "age": 50,
                "event_type": "health_milestone",
                "title": "Increased Healthcare Focus",
                "description": "Healthcare expenses typically begin increasing",
                "financial_impact": "healthcare_increase"
            })
        
        # Sort by year
        events.sort(key=lambda x: x["year"])
        
        return events
    
    def _generate_projections(
        self, current_position, incomes, expenses, profile, projection_years
    ) -> List[Dict[str, Any]]:
        """Generate year-by-year financial projections"""
        projections = []
        current_year = date.today().year
        
        # Starting values
        net_worth = Decimal(current_position["net_worth"]["amount"])
        monthly_income = Decimal(current_position["monthly_income"]["amount"])
        monthly_expenses = Decimal(current_position["monthly_expenses"]["amount"])
        
        # Growth assumptions (CFA-compliant conservative estimates)
        income_growth_rate = Decimal('0.03')  # 3% annual income growth
        expense_inflation = Decimal('0.025')   # 2.5% annual expense inflation
        investment_return = Decimal('0.07')    # 7% annual investment return
        
        for year_offset in range(projection_years + 1):
            year = current_year + year_offset
            age = profile.age + year_offset
            
            if year_offset > 0:
                # Apply growth rates
                monthly_income *= (Decimal('1') + income_growth_rate)
                monthly_expenses *= (Decimal('1') + expense_inflation)
                
                # Investment growth on existing net worth
                net_worth *= (Decimal('1') + investment_return)
                
                # Add annual surplus/deficit
                annual_surplus = (monthly_income - monthly_expenses) * Decimal('12')
                net_worth += annual_surplus
            
            projections.append({
                "year": year,
                "age": age,
                "net_worth": {
                    "amount": str(net_worth.quantize(Decimal('0.01'))),
                    "currency": "KES"
                },
                "annual_income": {
                    "amount": str((monthly_income * Decimal('12')).quantize(Decimal('0.01'))),
                    "currency": "KES"
                },
                "annual_expenses": {
                    "amount": str((monthly_expenses * Decimal('12')).quantize(Decimal('0.01'))),
                    "currency": "KES"
                },
                "annual_surplus": {
                    "amount": str(((monthly_income - monthly_expenses) * Decimal('12')).quantize(Decimal('0.01'))),
                    "currency": "KES"
                }
            })
        
        return projections
    
    def _generate_milestones(self, projections, life_events) -> List[Dict[str, Any]]:
        """Generate financial milestones based on projections"""
        milestones = []
        
        # Find when net worth reaches certain thresholds
        thresholds = [
            (Decimal('1000000'), "First Million KES"),
            (Decimal('10000000'), "10 Million KES Net Worth"),
            (Decimal('50000000'), "50 Million KES Milestone"),
            (Decimal('100000000'), "100 Million KES Achievement")
        ]
        
        for threshold, title in thresholds:
            for projection in projections:
                net_worth = Decimal(projection["net_worth"]["amount"])
                if net_worth >= threshold:
                    milestones.append({
                        "year": projection["year"],
                        "age": projection["age"],
                        "milestone_type": "net_worth",
                        "title": title,
                        "description": f"Net worth reaches {threshold:,.0f} KES",
                        "value": {
                            "amount": str(threshold),
                            "currency": "KES"
                        }
                    })
                    break
        
        # Financial independence milestone (25x annual expenses)
        if projections:
            latest_projection = projections[-1]
            final_expenses = Decimal(latest_projection["annual_expenses"]["amount"])
            fi_target = final_expenses * Decimal('25')
            
            for projection in projections:
                net_worth = Decimal(projection["net_worth"]["amount"])
                if net_worth >= fi_target:
                    milestones.append({
                        "year": projection["year"],
                        "age": projection["age"],
                        "milestone_type": "financial_independence",
                        "title": "Financial Independence",
                        "description": "Net worth equals 25x annual expenses",
                        "value": {
                            "amount": str(fi_target.quantize(Decimal('0.01'))),
                            "currency": "KES"
                        }
                    })
                    break
        
        # Sort by year
        milestones.sort(key=lambda x: x["year"])
        
        return milestones