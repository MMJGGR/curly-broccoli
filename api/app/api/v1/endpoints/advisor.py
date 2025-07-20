from typing import Any

from fastapi import APIRouter, Depends

from app.models import User
from app.security import get_current_user, RoleChecker

router = APIRouter()

@router.get("/advisor/dashboard", response_model=dict)
def read_advisor_dashboard(
    current_user: User = Depends(RoleChecker(allowed_roles=["advisor"]))
) -> Any:
    """Retrieve the advisor dashboard data (accessible only by advisors)."""
    return {"message": f"Welcome to the Advisor Dashboard, {current_user.email}!"}
