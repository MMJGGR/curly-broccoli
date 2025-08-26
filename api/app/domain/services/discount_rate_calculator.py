"""
CFA-Compliant Discount Rate Calculator Service
Dynamic calculation of discount rates based on employment profile and market conditions
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, Optional, List, Tuple
from datetime import datetime
from enum import Enum

from ..entities.financial_event import EmploymentProfileData


class RiskLevel(Enum):
    """Risk level categories for industries and roles"""
    VERY_LOW = "very_low"
    LOW = "low" 
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


@dataclass(frozen=True)
class RegionalRateData:
    """Regional economic data for discount rate calculation"""
    location: str
    risk_free_rate: Decimal  # Current government bond rate
    inflation_premium: Decimal  # Expected inflation
    economic_stability_factor: Decimal  # Country/regional risk adjustment
    currency: str = "KES"
    
    @property
    def base_discount_rate(self) -> Decimal:
        """Base discount rate before career-specific adjustments"""
        return self.risk_free_rate + self.inflation_premium + self.economic_stability_factor


@dataclass(frozen=True)
class IndustryRiskProfile:
    """Risk profile characteristics for an industry"""
    industry: str
    base_risk_premium: Decimal  # Base premium over risk-free rate
    stability_score: int  # 1-100, higher = more stable
    income_predictability: RiskLevel
    recession_sensitivity: RiskLevel
    automation_risk: RiskLevel
    growth_outlook: str  # "declining", "stable", "growing", "high_growth"
    
    def get_risk_level(self) -> RiskLevel:
        """Calculate overall risk level for industry"""
        risk_scores = {
            RiskLevel.VERY_LOW: 1,
            RiskLevel.LOW: 2,
            RiskLevel.MEDIUM: 3,
            RiskLevel.HIGH: 4,
            RiskLevel.VERY_HIGH: 5
        }
        
        avg_score = (
            risk_scores[self.income_predictability] +
            risk_scores[self.recession_sensitivity] +
            risk_scores[self.automation_risk]
        ) / 3
        
        if avg_score <= 1.5:
            return RiskLevel.VERY_LOW
        elif avg_score <= 2.5:
            return RiskLevel.LOW
        elif avg_score <= 3.5:
            return RiskLevel.MEDIUM
        elif avg_score <= 4.5:
            return RiskLevel.HIGH
        else:
            return RiskLevel.VERY_HIGH


@dataclass(frozen=True)
class DiscountRateComponents:
    """Detailed breakdown of discount rate calculation"""
    # Base Components
    risk_free_rate: Decimal
    inflation_premium: Decimal
    economic_stability_factor: Decimal
    
    # Career-Specific Components
    industry_risk_premium: Decimal
    role_level_adjustment: Decimal
    employment_type_premium: Decimal
    stability_adjustment: Decimal
    experience_adjustment: Decimal
    
    # Behavioral & Outlook Components
    income_variability_premium: Decimal
    career_outlook_adjustment: Decimal
    location_adjustment: Decimal
    
    # Total Rate
    @property
    def total_rate(self) -> Decimal:
        """Calculate total discount rate"""
        return (
            self.risk_free_rate +
            self.inflation_premium +
            self.economic_stability_factor +
            self.industry_risk_premium +
            self.role_level_adjustment +
            self.employment_type_premium +
            self.stability_adjustment +
            self.experience_adjustment +
            self.income_variability_premium +
            self.career_outlook_adjustment +
            self.location_adjustment
        )
    
    @property
    def base_rate(self) -> Decimal:
        """Base economic rate without career-specific factors"""
        return self.risk_free_rate + self.inflation_premium + self.economic_stability_factor
    
    @property
    def career_premium(self) -> Decimal:
        """Total career-specific risk premium"""
        return self.total_rate - self.base_rate


@dataclass
class DiscountRateValidation:
    """Validation results for discount rate calculations"""
    is_valid: bool
    rate_value: Decimal
    validation_warnings: List[str]
    professional_review_required: bool
    confidence_level: float  # 0.0 to 1.0
    
    # CFA Compliance
    meets_cfa_standards: bool
    cfa_notes: Optional[str] = None


class DiscountRateCalculator:
    """
    CFA-compliant discount rate calculator
    Implements professional standards for personal financial planning
    """
    
    # Industry Risk Profiles (CFA-aligned)
    INDUSTRY_PROFILES = {
        'government': IndustryRiskProfile(
            industry='government',
            base_risk_premium=Decimal('0.005'),  # 0.5%
            stability_score=95,
            income_predictability=RiskLevel.VERY_LOW,
            recession_sensitivity=RiskLevel.VERY_LOW,
            automation_risk=RiskLevel.LOW,
            growth_outlook='stable'
        ),
        'education': IndustryRiskProfile(
            industry='education',
            base_risk_premium=Decimal('0.010'),  # 1.0%
            stability_score=90,
            income_predictability=RiskLevel.LOW,
            recession_sensitivity=RiskLevel.LOW,
            automation_risk=RiskLevel.MEDIUM,
            growth_outlook='stable'
        ),
        'healthcare': IndustryRiskProfile(
            industry='healthcare',
            base_risk_premium=Decimal('0.015'),  # 1.5%
            stability_score=85,
            income_predictability=RiskLevel.LOW,
            recession_sensitivity=RiskLevel.LOW,
            automation_risk=RiskLevel.LOW,
            growth_outlook='growing'
        ),
        'financial_services': IndustryRiskProfile(
            industry='financial_services',
            base_risk_premium=Decimal('0.025'),  # 2.5%
            stability_score=75,
            income_predictability=RiskLevel.MEDIUM,
            recession_sensitivity=RiskLevel.HIGH,
            automation_risk=RiskLevel.HIGH,
            growth_outlook='stable'
        ),
        'technology': IndustryRiskProfile(
            industry='technology',
            base_risk_premium=Decimal('0.035'),  # 3.5%
            stability_score=65,
            income_predictability=RiskLevel.MEDIUM,
            recession_sensitivity=RiskLevel.MEDIUM,
            automation_risk=RiskLevel.LOW,
            growth_outlook='high_growth'
        ),
        'startup': IndustryRiskProfile(
            industry='startup',
            base_risk_premium=Decimal('0.065'),  # 6.5%
            stability_score=30,
            income_predictability=RiskLevel.VERY_HIGH,
            recession_sensitivity=RiskLevel.VERY_HIGH,
            automation_risk=RiskLevel.MEDIUM,
            growth_outlook='high_growth'
        ),
        'gig_economy': IndustryRiskProfile(
            industry='gig_economy',
            base_risk_premium=Decimal('0.075'),  # 7.5%
            stability_score=25,
            income_predictability=RiskLevel.VERY_HIGH,
            recession_sensitivity=RiskLevel.VERY_HIGH,
            automation_risk=RiskLevel.VERY_HIGH,
            growth_outlook='uncertain'
        )
    }
    
    # Role Level Multipliers
    ROLE_LEVEL_MULTIPLIERS = {
        'entry': Decimal('1.3'),      # Higher career risk for new professionals
        'mid': Decimal('1.0'),        # Base multiplier
        'senior': Decimal('0.8'),     # Lower risk, more stability
        'executive': Decimal('0.6'),  # Highest stability, but higher variability
        'owner': Decimal('1.8')       # Business owner risk premium
    }
    
    # Employment Type Premiums
    EMPLOYMENT_TYPE_PREMIUMS = {
        'permanent': Decimal('0.000'),  # No additional premium
        'contract': Decimal('0.015'),   # 1.5% premium
        'freelance': Decimal('0.035'),  # 3.5% premium  
        'business_owner': Decimal('0.050')  # 5.0% premium
    }
    
    # Regional Rate Data (Kenya-focused)
    REGIONAL_RATES = {
        'nairobi': RegionalRateData(
            location='nairobi',
            risk_free_rate=Decimal('0.085'),  # 8.5% Kenya government bonds
            inflation_premium=Decimal('0.025'),  # 2.5% expected inflation
            economic_stability_factor=Decimal('0.015')  # 1.5% country risk
        ),
        'mombasa': RegionalRateData(
            location='mombasa',
            risk_free_rate=Decimal('0.085'),
            inflation_premium=Decimal('0.025'),
            economic_stability_factor=Decimal('0.015')
        ),
        'rural': RegionalRateData(
            location='rural',
            risk_free_rate=Decimal('0.090'),  # Slightly higher rural risk
            inflation_premium=Decimal('0.030'),
            economic_stability_factor=Decimal('0.020')
        )
    }
    
    def calculate_human_capital_discount_rate(
        self, 
        employment_profile: EmploymentProfileData,
        user_age: Optional[int] = None
    ) -> Tuple[Decimal, DiscountRateComponents]:
        """
        Calculate CFA-compliant discount rate for human capital valuation
        
        Returns:
            Tuple of (final_rate, detailed_components)
        """
        
        # Get regional base rates
        regional_data = self.REGIONAL_RATES.get(
            employment_profile.work_location, 
            self.REGIONAL_RATES['nairobi']  # Default to Nairobi rates
        )
        
        # Get industry risk profile
        industry_profile = self.INDUSTRY_PROFILES.get(
            employment_profile.industry_sector,
            self.INDUSTRY_PROFILES['technology']  # Default fallback
        )
        
        # Calculate components
        components = DiscountRateComponents(
            # Base Economic Factors
            risk_free_rate=regional_data.risk_free_rate,
            inflation_premium=regional_data.inflation_premium,
            economic_stability_factor=regional_data.economic_stability_factor,
            
            # Industry Risk
            industry_risk_premium=industry_profile.base_risk_premium,
            
            # Role Level Adjustment
            role_level_adjustment=industry_profile.base_risk_premium * (
                self.ROLE_LEVEL_MULTIPLIERS[employment_profile.job_role_level] - Decimal('1.0')
            ),
            
            # Employment Type Premium
            employment_type_premium=self.EMPLOYMENT_TYPE_PREMIUMS[employment_profile.employment_type],
            
            # Stability Based on Tenure
            stability_adjustment=self._calculate_stability_adjustment(employment_profile),
            
            # Experience Adjustment
            experience_adjustment=self._calculate_experience_adjustment(employment_profile, user_age),
            
            # Income Variability Premium
            income_variability_premium=self._calculate_income_variability_premium(employment_profile),
            
            # Career Outlook Adjustment
            career_outlook_adjustment=self._calculate_career_outlook_adjustment(employment_profile),
            
            # Location Adjustment (urban vs rural premium)
            location_adjustment=self._calculate_location_adjustment(employment_profile)
        )
        
        # Apply bounds checking
        final_rate = max(
            Decimal('0.020'),  # Minimum 2%
            min(Decimal('0.150'), components.total_rate)  # Maximum 15%
        )
        
        return final_rate, components
    
    def calculate_expense_liability_discount_rate(
        self,
        expense_type: str,  # 'essential' or 'discretionary'
        employment_profile: EmploymentProfileData,
        user_age: Optional[int] = None
    ) -> Tuple[Decimal, DiscountRateComponents]:
        """
        Calculate discount rate for expense liabilities (future expenses)
        Generally lower than human capital rates due to greater certainty
        """
        
        # Get base rate (lower than human capital)
        regional_data = self.REGIONAL_RATES.get(
            employment_profile.work_location,
            self.REGIONAL_RATES['nairobi']
        )
        
        # Essential expenses have lower discount rates (more certain)
        expense_risk_premium = (
            Decimal('0.005') if expense_type == 'essential' 
            else Decimal('0.015')  # Discretionary expenses less certain
        )
        
        components = DiscountRateComponents(
            risk_free_rate=regional_data.risk_free_rate,
            inflation_premium=regional_data.inflation_premium,
            economic_stability_factor=Decimal('0.005'),  # Lower than income
            
            # Minimal career-specific factors for expenses
            industry_risk_premium=expense_risk_premium,
            role_level_adjustment=Decimal('0.000'),
            employment_type_premium=Decimal('0.000'),
            stability_adjustment=Decimal('0.000'),
            experience_adjustment=Decimal('0.000'),
            income_variability_premium=Decimal('0.000'),
            career_outlook_adjustment=Decimal('0.000'),
            location_adjustment=Decimal('0.000')
        )
        
        # Apply bounds
        final_rate = max(
            Decimal('0.015'),  # Minimum 1.5%
            min(Decimal('0.100'), components.total_rate)  # Maximum 10%
        )
        
        return final_rate, components
    
    def validate_discount_rate(
        self,
        rate: Decimal,
        rate_type: str,  # 'human_capital' or 'expense_liability'
        employment_profile: EmploymentProfileData
    ) -> DiscountRateValidation:
        """
        Validate a discount rate against CFA professional standards
        """
        warnings = []
        professional_review = False
        meets_cfa = True
        confidence = 1.0
        
        # Basic range validation
        if rate_type == 'human_capital':
            if rate < Decimal('0.015'):
                warnings.append("Rate below risk-free treasury yield - may undervalue career risk")
                confidence *= 0.7
            if rate > Decimal('0.150'):
                warnings.append("Rate above reasonable maximum - may be too conservative")
                professional_review = True
                confidence *= 0.5
        else:  # expense_liability
            if rate < Decimal('0.010'):
                warnings.append("Expense rate below inflation - may undervalue future costs")
                confidence *= 0.8
            if rate > Decimal('0.100'):
                warnings.append("Expense rate too high - may overvalue future obligations")
                professional_review = True
                confidence *= 0.6
        
        # Industry-specific validation
        industry_profile = self.INDUSTRY_PROFILES.get(employment_profile.industry_sector)
        if industry_profile:
            expected_range = self._get_expected_rate_range(industry_profile, employment_profile)
            if rate < expected_range[0] or rate > expected_range[1]:
                warnings.append(f"Rate outside expected range for {employment_profile.industry_sector} industry")
                confidence *= 0.8
        
        # Professional review triggers
        if len(warnings) > 2:
            professional_review = True
            meets_cfa = False
        
        return DiscountRateValidation(
            is_valid=len([w for w in warnings if "unreasonable" in w.lower()]) == 0,
            rate_value=rate,
            validation_warnings=warnings,
            professional_review_required=professional_review,
            confidence_level=confidence,
            meets_cfa_standards=meets_cfa,
            cfa_notes=f"Validated against CFA standards for {employment_profile.industry_sector} professionals"
        )
    
    def _calculate_stability_adjustment(self, profile: EmploymentProfileData) -> Decimal:
        """Calculate adjustment based on employment stability"""
        # More tenure = lower risk
        tenure_factor = min(profile.years_current_employer / 5.0, 1.0)  # Max benefit at 5 years
        return Decimal('-0.010') * Decimal(str(tenure_factor))  # Up to -1% for stability
    
    def _calculate_experience_adjustment(self, profile: EmploymentProfileData, user_age: Optional[int]) -> Decimal:
        """Calculate adjustment based on experience and age"""
        if user_age is None:
            return Decimal('0.000')
        
        # Peak earning years (35-50) get slight discount
        if 35 <= user_age <= 50:
            return Decimal('-0.005')  # -0.5%
        elif user_age > 55:
            return Decimal('0.010')   # +1% for later career risk
        else:
            return Decimal('0.000')
    
    def _calculate_income_variability_premium(self, profile: EmploymentProfileData) -> Decimal:
        """Calculate premium based on income variability"""
        variability_premiums = {
            'fixed': Decimal('0.000'),
            'commission_based': Decimal('0.020'),  # 2%
            'seasonal': Decimal('0.015'),          # 1.5%
            'project_based': Decimal('0.025')     # 2.5%
        }
        
        base_premium = variability_premiums.get(profile.income_variability, Decimal('0.000'))
        
        # Adjust for bonus/stock compensation
        bonus_adjustment = Decimal(str(profile.bonus_percentage / 100)) * Decimal('0.010')
        stock_adjustment = Decimal(str(profile.stock_compensation_percentage / 100)) * Decimal('0.015')
        
        return base_premium + bonus_adjustment + stock_adjustment
    
    def _calculate_career_outlook_adjustment(self, profile: EmploymentProfileData) -> Decimal:
        """Calculate adjustment based on career and industry outlook"""
        outlook_adjustments = {
            'declining': Decimal('0.015'),    # 1.5% premium for declining industry
            'stable': Decimal('0.000'),      # No adjustment
            'growing': Decimal('-0.005'),    # -0.5% for growing industry
            'high_growth': Decimal('-0.010') # -1% for high growth
        }
        
        industry_adj = outlook_adjustments.get(profile.industry_growth_outlook, Decimal('0.000'))
        
        # Skill obsolescence risk
        skill_risk_adj = {
            'low': Decimal('0.000'),
            'medium': Decimal('0.005'),      # 0.5%
            'high': Decimal('0.015')         # 1.5%
        }.get(profile.skill_obsolescence_risk, Decimal('0.000'))
        
        return industry_adj + skill_risk_adj
    
    def _calculate_location_adjustment(self, profile: EmploymentProfileData) -> Decimal:
        """Calculate adjustment based on work location"""
        location_adjustments = {
            'nairobi': Decimal('0.000'),     # No adjustment (base)
            'mombasa': Decimal('0.002'),     # Slight premium
            'rural': Decimal('0.010'),       # Higher premium for rural
            'remote': Decimal('0.005')       # Remote work premium
        }
        
        return location_adjustments.get(profile.work_location, Decimal('0.000'))
    
    def _get_expected_rate_range(
        self, 
        industry_profile: IndustryRiskProfile, 
        employment_profile: EmploymentProfileData
    ) -> Tuple[Decimal, Decimal]:
        """Get expected rate range for validation"""
        base_rate = self.REGIONAL_RATES['nairobi'].base_discount_rate
        industry_rate = base_rate + industry_profile.base_risk_premium
        
        role_multiplier = self.ROLE_LEVEL_MULTIPLIERS[employment_profile.job_role_level]
        
        # Expected range: ±50% around calculated rate
        center_rate = industry_rate * role_multiplier
        range_width = center_rate * Decimal('0.5')
        
        return (
            max(Decimal('0.020'), center_rate - range_width),
            min(Decimal('0.150'), center_rate + range_width)
        )