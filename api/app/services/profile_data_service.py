"""
ProfileDataService - Single Source of Truth for Profile Data Operations
Replaces all fragmented profile data transfer logic
"""
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from api.app.models import User, OnboardingState, Profile
from api.app.utils.risk_calculation import calculate_risk_score, get_risk_level_numeric

logger = logging.getLogger(__name__)

class ProfileDataTransferError(Exception):
    """Custom exception for profile data transfer failures"""
    pass

class ProfileDataService:
    """Single authoritative service for all profile data operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def validate_onboarding_completeness(self, onboarding: OnboardingState) -> Tuple[bool, list]:
        """Validate that onboarding data is complete enough for profile transfer"""
        missing_data = []
        
        # Check required data sections
        if not onboarding.personal_data:
            missing_data.append("personal_data")
        else:
            required_personal = ['firstName', 'lastName', 'dateOfBirth']
            for field in required_personal:
                if not onboarding.personal_data.get(field):
                    missing_data.append(f"personal_data.{field}")
        
        if not onboarding.financial_data:
            missing_data.append("financial_data")
        else:
            if not onboarding.financial_data.get('monthlyIncome'):
                missing_data.append("financial_data.monthlyIncome")
        
        if not onboarding.risk_data:
            missing_data.append("risk_data")
        else:
            if not onboarding.risk_data.get('questionnaire'):
                missing_data.append("risk_data.questionnaire")
        
        is_complete = len(missing_data) == 0
        return is_complete, missing_data
    
    def transfer_onboarding_to_profile(self, user_id: int, force_overwrite: bool = False) -> Dict[str, Any]:
        """
        Single authoritative method to transfer onboarding data to profile
        This replaces all other scattered transfer logic
        """
        try:
            # Get onboarding state
            onboarding = self.db.query(OnboardingState).filter_by(user_id=user_id).first()
            if not onboarding:
                raise ProfileDataTransferError("No onboarding state found")
            
            # Validate completeness
            is_complete, missing_data = self.validate_onboarding_completeness(onboarding)
            if not is_complete:
                raise ProfileDataTransferError(f"Incomplete onboarding data: {missing_data}")
            
            # Get or create profile
            profile = self.db.query(Profile).filter_by(user_id=user_id).first()
            
            # Check if profile already has complete data (unless forcing overwrite)
            if not force_overwrite and profile and self._is_profile_complete(profile):
                return {
                    "success": False,
                    "error": "Profile already complete. Use force_overwrite=True to override.",
                    "profile_data": self._get_profile_summary(profile)
                }
            
            # Create new profile if needed
            if not profile:
                profile = Profile(user_id=user_id)
                self.db.add(profile)
            
            # Transfer data using atomic transaction
            self._transfer_personal_data(onboarding, profile)
            self._transfer_financial_data(onboarding, profile)
            self._transfer_risk_data(onboarding, profile)
            self._transfer_goals_data(onboarding, profile)
            
            # Mark onboarding as complete
            onboarding.is_complete = True
            if not onboarding.completed_at:
                onboarding.completed_at = datetime.utcnow()
            
            # Commit transaction
            self.db.commit()
            self.db.refresh(profile)
            
            logger.info(f"Successfully transferred onboarding data to profile for user {user_id}")
            
            return {
                "success": True,
                "message": "Profile data transfer completed successfully",
                "profile_data": self._get_profile_summary(profile)
            }
            
        except Exception as e:
            self.db.rollback()
            error_msg = f"Profile data transfer failed for user {user_id}: {str(e)}"
            logger.error(error_msg)
            raise ProfileDataTransferError(error_msg)
    
    def _transfer_personal_data(self, onboarding: OnboardingState, profile: Profile):
        """Transfer personal information with validation"""
        personal = onboarding.personal_data
        if not personal:
            raise ProfileDataTransferError("Missing personal data")
        
        profile.first_name = personal.get('firstName')
        profile.last_name = personal.get('lastName')
        
        # Handle date of birth with proper error handling
        dob_str = personal.get('dateOfBirth')
        if dob_str:
            try:
                profile.date_of_birth = datetime.strptime(dob_str, '%Y-%m-%d').date()
            except (ValueError, TypeError) as e:
                raise ProfileDataTransferError(f"Invalid date format for dateOfBirth: {dob_str}")
        
        profile.phone = personal.get('phone')
        profile.nationalId = personal.get('nationalId')
        profile.kra_pin = personal.get('kraPin')
        profile.employment_status = personal.get('employmentStatus', 'Employed')
        
        # Handle dependents with proper conversion
        dependents_str = personal.get('dependents', '0')
        try:
            profile.dependents = int(dependents_str) if dependents_str else 0
        except (ValueError, TypeError):
            profile.dependents = 0
        
        logger.info(f"Transferred personal data: {profile.first_name} {profile.last_name}")
    
    def _transfer_financial_data(self, onboarding: OnboardingState, profile: Profile):
        """Transfer financial information with comprehensive calculations"""
        financial = onboarding.financial_data
        if not financial:
            raise ProfileDataTransferError("Missing financial data")
        
        # Monthly income - core field
        monthly_income_str = financial.get('monthlyIncome', '0')
        try:
            monthly_income = float(monthly_income_str) if monthly_income_str else 0
        except (ValueError, TypeError):
            raise ProfileDataTransferError(f"Invalid monthlyIncome value: {monthly_income_str}")
        
        profile.monthly_income = monthly_income
        profile.annual_income = monthly_income * 12
        
        # Calculate monthly expenses from all expense categories
        expense_fields = ['rent', 'utilities', 'groceries', 'transport', 'loanRepayments']
        total_expenses = 0
        
        for field in expense_fields:
            expense_val = financial.get(field, 0)
            try:
                expense_amount = float(expense_val) if expense_val else 0
                total_expenses += expense_amount
            except (ValueError, TypeError):
                logger.warning(f"Invalid expense value for {field}: {expense_val}")
                continue
        
        # Add custom expenses if present
        custom_expenses = financial.get('customExpenses', [])
        if isinstance(custom_expenses, list):
            for expense in custom_expenses:
                if isinstance(expense, dict):
                    try:
                        amount = float(expense.get('amount', 0))
                        total_expenses += amount
                    except (ValueError, TypeError):
                        continue
        
        profile.monthly_expenses = total_expenses
        
        # Current savings
        current_savings_str = financial.get('currentSavings', '0')
        try:
            profile.current_savings = float(current_savings_str) if current_savings_str else 0
        except (ValueError, TypeError):
            profile.current_savings = 0
        
        # Monthly debt payments
        loan_payments_str = financial.get('loanRepayments', '0')
        try:
            profile.monthly_debt_payments = float(loan_payments_str) if loan_payments_str else 0
        except (ValueError, TypeError):
            profile.monthly_debt_payments = 0
        
        logger.info(f"Transferred financial data: Income={monthly_income}, Expenses={total_expenses}, Savings={profile.current_savings}")
    
    def _transfer_risk_data(self, onboarding: OnboardingState, profile: Profile):
        """Transfer risk assessment data with proper risk calculation"""
        risk = onboarding.risk_data
        if not risk:
            raise ProfileDataTransferError("Missing risk data")
        
        questionnaire = risk.get('questionnaire')
        if not questionnaire or not isinstance(questionnaire, list) or len(questionnaire) != 5:
            raise ProfileDataTransferError("Invalid questionnaire data - must be list of 5 values")
        
        # Validate questionnaire values
        for i, value in enumerate(questionnaire):
            if not isinstance(value, (int, float)) or not (1 <= value <= 5):
                raise ProfileDataTransferError(f"Invalid questionnaire value at position {i}: {value}")
        
        profile.questionnaire = questionnaire
        
        # Calculate risk score using utility function
        risk_score = calculate_risk_score(questionnaire)
        profile.risk_score = risk_score
        profile.risk_level = get_risk_level_numeric(risk_score)
        
        logger.info(f"Transferred risk data: Score={risk_score}, Level={profile.risk_level}")
    
    def _transfer_goals_data(self, onboarding: OnboardingState, profile: Profile):
        """Transfer goals and targets data"""
        goals = onboarding.goals_data
        if not goals:
            # Goals are optional, so just set empty dict
            profile.goals = {}
            return
        
        profile.goals = goals
        
        # Extract specific goal fields for direct access
        retirement_age_str = goals.get('retirementAge')
        if retirement_age_str:
            try:
                profile.retirement_age = int(retirement_age_str)
            except (ValueError, TypeError):
                profile.retirement_age = None
        
        emergency_fund_str = goals.get('emergencyFund')
        if emergency_fund_str:
            try:
                profile.emergency_fund_target = float(emergency_fund_str)
            except (ValueError, TypeError):
                profile.emergency_fund_target = None
        
        logger.info(f"Transferred goals data: Retirement={profile.retirement_age}, Emergency Fund={profile.emergency_fund_target}")
    
    def _is_profile_complete(self, profile: Profile) -> bool:
        """Check if profile has complete meaningful data"""
        return (
            profile.first_name and
            profile.first_name != "New" and  # Not placeholder
            profile.annual_income and
            profile.annual_income > 0 and
            profile.monthly_income and
            profile.monthly_income > 0 and
            profile.date_of_birth and
            str(profile.date_of_birth) != "1990-01-01"  # Not default
        )
    
    def _get_profile_summary(self, profile: Profile) -> Dict[str, Any]:
        """Get summary of profile data for responses"""
        return {
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "annual_income": profile.annual_income,
            "monthly_income": profile.monthly_income,
            "monthly_expenses": profile.monthly_expenses,
            "current_savings": profile.current_savings,
            "dependents": profile.dependents,
            "risk_score": profile.risk_score,
            "risk_level": profile.risk_level,
            "employment_status": profile.employment_status
        }
    
    def get_profile_validation_report(self, user_id: int) -> Dict[str, Any]:
        """Generate comprehensive validation report for user profile data"""
        user = self.db.query(User).filter_by(id=user_id).first()
        if not user:
            return {"error": "User not found"}
        
        onboarding = self.db.query(OnboardingState).filter_by(user_id=user_id).first()
        profile = self.db.query(Profile).filter_by(user_id=user_id).first()
        
        report = {
            "user_id": user_id,
            "email": user.email,
            "onboarding_status": {},
            "profile_status": {},
            "data_consistency": {},
            "recommendations": []
        }
        
        # Onboarding status
        if onboarding:
            is_complete, missing_data = self.validate_onboarding_completeness(onboarding)
            report["onboarding_status"] = {
                "exists": True,
                "is_complete": is_complete,
                "missing_data": missing_data,
                "completed_steps": onboarding.completed_steps
            }
        else:
            report["onboarding_status"] = {"exists": False}
            report["recommendations"].append("Complete onboarding process")
        
        # Profile status
        if profile:
            is_complete = self._is_profile_complete(profile)
            report["profile_status"] = {
                "exists": True,
                "is_complete": is_complete,
                "summary": self._get_profile_summary(profile)
            }
        else:
            report["profile_status"] = {"exists": False}
            report["recommendations"].append("Create user profile")
        
        # Data consistency
        if onboarding and profile:
            consistency_issues = self._check_data_consistency(onboarding, profile)
            report["data_consistency"] = {
                "issues": consistency_issues,
                "is_consistent": len(consistency_issues) == 0
            }
            
            if consistency_issues:
                report["recommendations"].append("Run profile data transfer to fix consistency issues")
        
        # Health score
        health_score = 100
        if not report["onboarding_status"].get("exists"): health_score -= 30
        if not report["profile_status"].get("exists"): health_score -= 40
        if not report["profile_status"].get("is_complete", True): health_score -= 20
        if not report["data_consistency"].get("is_consistent", True): health_score -= 10
        
        report["health_score"] = health_score
        report["status"] = (
            "healthy" if health_score >= 90 else
            "needs_attention" if health_score >= 70 else
            "critical"
        )
        
        return report
    
    def _check_data_consistency(self, onboarding: OnboardingState, profile: Profile) -> list:
        """Check for data consistency issues between onboarding and profile"""
        issues = []
        
        # Check name consistency
        if (onboarding.personal_data and 
            onboarding.personal_data.get('firstName') != profile.first_name):
            issues.append("First name mismatch")
        
        # Check income consistency
        if (onboarding.financial_data and 
            onboarding.financial_data.get('monthlyIncome')):
            try:
                onboarding_monthly = float(onboarding.financial_data.get('monthlyIncome', 0))
                if profile.monthly_income and abs(onboarding_monthly - profile.monthly_income) > 1:
                    issues.append("Monthly income mismatch")
            except (ValueError, TypeError):
                issues.append("Invalid income data in onboarding")
        
        return issues