from typing import List, Optional
from pydantic import BaseModel

class RiskProfileBase(BaseModel):
    questionnaire_answers: List[int] # Assuming answers are integers, adjust as needed
    risk_score: Optional[int] = None
    risk_level: Optional[int] = None

class RiskProfileCreate(RiskProfileBase):
    pass

class RiskProfileUpdate(RiskProfileBase):
    pass

class RiskProfile(RiskProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
