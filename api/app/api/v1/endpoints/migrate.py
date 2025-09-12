
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.services.profile_data_service import ProfileDataService, ProfileDataTransferError

router = APIRouter(prefix="/migrate", tags=["migrate"])

@router.post("/{user_id}")
def migrate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Migrate a user's onboarding data to the new format"""
    if not current_user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )

    try:
        profile_service = ProfileDataService(db)
        transfer_result = profile_service.transfer_onboarding_to_profile(
            user_id=user_id,
            force_overwrite=True
        )
        
        if not transfer_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=transfer_result.get("error", "Profile transfer failed")
            )
        
        return {"success": True, "message": f"User {user_id} migrated successfully"}
        
    except ProfileDataTransferError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to migrate user: {str(e)}"
        )
