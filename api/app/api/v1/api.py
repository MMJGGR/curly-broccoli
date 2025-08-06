from fastapi import APIRouter

from api.app.api.v1.endpoints import profile, onboarding_clean, profile_clean, timeline_clean

api_router = APIRouter()
api_router.include_router(profile.router, tags=["profile"])
api_router.include_router(onboarding_clean.router, tags=["onboarding-clean"])
api_router.include_router(profile_clean.router, prefix="/profile", tags=["profile-clean"])
api_router.include_router(timeline_clean.router, prefix="/timeline", tags=["timeline-clean"])
