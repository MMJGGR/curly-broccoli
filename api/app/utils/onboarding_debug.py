"""
Onboarding Debug Utilities - For monitoring and troubleshooting the fixed onboarding system
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List, Optional
import json
import logging

from ..models import OnboardingState, User

logger = logging.getLogger(__name__)

class OnboardingDebugger:
    """Utility class for debugging onboarding state and completion issues"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_detailed_state(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive onboarding state for debugging"""
        onboarding = self.db.query(OnboardingState).filter_by(user_id=user_id).first()
        user = self.db.query(User).filter_by(id=user_id).first()
        
        if not onboarding:
            return {
                "error": "No onboarding state found",
                "user_id": user_id,
                "user_email": user.email if user else "Unknown"
            }
        
        return {
            "user_id": user_id,
            "user_email": user.email if user else "Unknown",
            "onboarding_id": onboarding.id,
            "current_step": onboarding.current_step,
            "completed_steps": onboarding.completed_steps,
            "completed_steps_type": type(onboarding.completed_steps).__name__,
            "completed_steps_length": len(onboarding.completed_steps) if onboarding.completed_steps else 0,
            "is_complete": onboarding.is_complete,
            
            # Data validation
            "data_validation": {
                "personal_data_present": bool(onboarding.personal_data),
                "personal_data_valid": self._validate_personal_data(onboarding.personal_data),
                "risk_data_present": bool(onboarding.risk_data),
                "risk_data_valid": self._validate_risk_data(onboarding.risk_data),
                "financial_data_present": bool(onboarding.financial_data),
                "financial_data_valid": self._validate_financial_data(onboarding.financial_data),
                "goals_data_present": bool(onboarding.goals_data),
                "preferences_data_present": bool(onboarding.preferences_data),
            },
            
            # Completion readiness
            "completion_readiness": {
                "required_steps": [1, 2, 3],
                "missing_steps": [step for step in [1, 2, 3] if step not in (onboarding.completed_steps or [])],
                "can_complete": self._can_complete_onboarding(onboarding),
                "completion_blocking_issues": self._get_completion_blockers(onboarding)
            },
            
            # Timestamps
            "timestamps": {
                "created_at": onboarding.created_at.isoformat() if onboarding.created_at else None,
                "updated_at": onboarding.updated_at.isoformat() if onboarding.updated_at else None,
                "completed_at": onboarding.completed_at.isoformat() if onboarding.completed_at else None
            }
        }
    
    def _validate_personal_data(self, data: Optional[Dict]) -> bool:
        """Validate personal data completeness"""
        if not data:
            return False
        
        required_fields = ['firstName', 'lastName', 'dateOfBirth', 'phone']
        return all(data.get(field) for field in required_fields)
    
    def _validate_risk_data(self, data: Optional[Dict]) -> bool:
        """Validate risk assessment data"""
        if not data:
            return False
        
        questionnaire = data.get('questionnaire', [])
        return isinstance(questionnaire, list) and len(questionnaire) == 5
    
    def _validate_financial_data(self, data: Optional[Dict]) -> bool:
        """Validate financial data"""
        if not data:
            return False
        
        monthly_income = data.get('monthlyIncome')
        return monthly_income and float(monthly_income) > 0
    
    def _can_complete_onboarding(self, onboarding: OnboardingState) -> bool:
        """Check if onboarding can be completed"""
        if not onboarding.completed_steps:
            return False
        
        required_steps = [1, 2, 3]
        return all(step in onboarding.completed_steps for step in required_steps)
    
    def _get_completion_blockers(self, onboarding: OnboardingState) -> List[str]:
        """Get list of issues blocking completion"""
        blockers = []
        
        if not onboarding.completed_steps:
            blockers.append("No completed steps found")
            return blockers
        
        required_steps = [1, 2, 3]
        missing_steps = [step for step in required_steps if step not in onboarding.completed_steps]
        
        if missing_steps:
            blockers.append(f"Missing required steps: {missing_steps}")
        
        # Data validation blockers
        if not self._validate_personal_data(onboarding.personal_data):
            blockers.append("Invalid or incomplete personal data")
        
        if not self._validate_risk_data(onboarding.risk_data):
            blockers.append("Invalid or incomplete risk assessment data")
        
        if not self._validate_financial_data(onboarding.financial_data):
            blockers.append("Invalid or incomplete financial data")
        
        return blockers
    
    def fix_corrupted_completed_steps(self, user_id: int) -> Dict[str, Any]:
        """Attempt to fix corrupted completed_steps array"""
        onboarding = self.db.query(OnboardingState).filter_by(user_id=user_id).first()
        
        if not onboarding:
            return {"error": "No onboarding state found"}
        
        # Determine which steps should be completed based on data presence
        should_be_completed = []
        
        if self._validate_personal_data(onboarding.personal_data):
            should_be_completed.append(1)
        
        if self._validate_risk_data(onboarding.risk_data):
            should_be_completed.append(2)
        
        if self._validate_financial_data(onboarding.financial_data):
            should_be_completed.append(3)
        
        if onboarding.goals_data and any(onboarding.goals_data.values()):
            should_be_completed.append(4)
        
        # Fix the completed_steps array
        original_completed = onboarding.completed_steps or []
        onboarding.completed_steps = should_be_completed.copy()
        onboarding.updated_at = datetime.utcnow()
        
        # Update completion status
        if len(should_be_completed) >= 3:  # Steps 1-3 are required
            onboarding.is_complete = True
            if not onboarding.completed_at:
                onboarding.completed_at = datetime.utcnow()
        
        try:
            self.db.flush()
            self.db.commit()
            self.db.refresh(onboarding)
            
            return {
                "success": True,
                "message": "Completed steps array fixed",
                "original_completed_steps": original_completed,
                "fixed_completed_steps": onboarding.completed_steps,
                "is_complete": onboarding.is_complete
            }
        
        except Exception as e:
            self.db.rollback()
            return {
                "error": f"Failed to fix completed steps: {str(e)}",
                "original_completed_steps": original_completed
            }
    
    def reset_onboarding_state(self, user_id: int, keep_data: bool = True) -> Dict[str, Any]:
        """Reset onboarding state while optionally preserving data"""
        onboarding = self.db.query(OnboardingState).filter_by(user_id=user_id).first()
        
        if not onboarding:
            return {"error": "No onboarding state found"}
        
        # Store original data if keeping it
        original_data = None
        if keep_data:
            original_data = {
                "personal_data": onboarding.personal_data,
                "risk_data": onboarding.risk_data,
                "financial_data": onboarding.financial_data,
                "goals_data": onboarding.goals_data,
                "preferences_data": onboarding.preferences_data
            }
        
        # Reset state
        onboarding.current_step = 1
        onboarding.completed_steps = []
        onboarding.is_complete = False
        onboarding.completed_at = None
        onboarding.updated_at = datetime.utcnow()
        
        if not keep_data:
            onboarding.personal_data = None
            onboarding.risk_data = None
            onboarding.financial_data = None
            onboarding.goals_data = None
            onboarding.preferences_data = None
        
        try:
            self.db.flush()
            self.db.commit()
            self.db.refresh(onboarding)
            
            return {
                "success": True,
                "message": f"Onboarding state reset (data {'preserved' if keep_data else 'cleared'})",
                "data_preserved": keep_data,
                "original_data": original_data if keep_data else None
            }
        
        except Exception as e:
            self.db.rollback()
            return {"error": f"Failed to reset onboarding state: {str(e)}"}


def log_onboarding_save_attempt(user_id: int, step_number: int, step_data: Dict[str, Any], 
                               completed_steps_before: List[int], completed_steps_after: List[int],
                               success: bool, error: Optional[str] = None):
    """Log detailed information about onboarding save attempts for debugging"""
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "step_number": step_number,
        "step_data_keys": list(step_data.keys()) if step_data else [],
        "completed_steps_before": completed_steps_before,
        "completed_steps_after": completed_steps_after,
        "success": success,
        "error": error,
        "step_was_added": step_number in completed_steps_after and step_number not in completed_steps_before
    }
    
    if success:
        logger.info(f"Onboarding save success: {json.dumps(log_entry)}")
    else:
        logger.error(f"Onboarding save failed: {json.dumps(log_entry)}")