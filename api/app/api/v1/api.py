from fastapi import APIRouter

from api.app.api.v1.endpoints import profile, advisor

api_router = APIRouter()
api_router.include_router(profile.router, tags=["profile"])
api_router.include_router(advisor.router, tags=["advisor"])
