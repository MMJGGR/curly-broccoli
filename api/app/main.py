import os
import uuid
import inspect
from fastapi import FastAPI, Request, Response, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .database import engine, get_db
from .auth import router as auth_router
from .profile import router as profile_router
from .accounts import router as accounts_router
from .transactions import router as transactions_router
from .milestones import router as milestones_router
from .goals import router as goals_router
from .income_sources import router as income_sources_router
from .expense_categories import router as expense_categories_router
from .dev import router as dev_router
# from .onboarding import router as onboarding_router  # REMOVED - conflicting with v1 API
from api.app.api.v1.api import api_router
from api.app.core.exceptions import UnauthorizedException, ForbiddenException, NotFoundException, ConflictException, UnprocessableEntityException

# Import all models to register them with SQLAlchemy
from .models import (
    Base, User, Profile, RiskProfile, OnboardingState, Account, 
    Transaction, Milestone, Goal, IncomeSource, ExpenseCategory
)

# Create any tables that don't yet exist
Base.metadata.create_all(bind=engine)


from pydantic import BaseModel
from compute.operations import add

app = FastAPI(title=os.getenv("APP_NAME", "FastAPI App"))

@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    trace_id = str(uuid.uuid4())
    request.state.trace_id = trace_id  # Ensure trace_id is always set
    response = await call_next(request)
    response.headers["X-Trace-ID"] = trace_id
    return response




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request: Request, exc: UnauthorizedException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "trace_id": request.state.trace_id},
        headers=exc.headers
    )

@app.exception_handler(ForbiddenException)
async def forbidden_exception_handler(request: Request, exc: ForbiddenException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "trace_id": request.state.trace_id},
    )

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "trace_id": request.state.trace_id},
    )

@app.exception_handler(ConflictException)
async def conflict_exception_handler(request: Request, exc: ConflictException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "trace_id": request.state.trace_id},
    )

@app.exception_handler(UnprocessableEntityException)
async def unprocessable_entity_exception_handler(request: Request, exc: UnprocessableEntityException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "trace_id": request.state.trace_id},
    )



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "trace_id": request.state.trace_id},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "trace_id": request.state.trace_id},
        headers=exc.headers
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error", "trace_id": request.state.trace_id},
    )

@app.get("/")
def read_root():
    return {"message": "Hello World"}

class Message(BaseModel):
    message: str

@app.get("/healthz")
def healthz():
    return {"status": "ok", "engines": {}}

@app.post("/echo")
def echo(msg: Message):
    return {"message": msg.message}

class Numbers(BaseModel):
    a: int
    b: int

@app.post("/add")
def add_numbers(nums: Numbers):
    result = add(nums.a, nums.b)
    return {"result": result}

# mount your routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(accounts_router)
app.include_router(transactions_router)
app.include_router(milestones_router)
app.include_router(goals_router)
app.include_router(income_sources_router)
app.include_router(expense_categories_router)
app.include_router(dev_router)
# app.include_router(onboarding_router)  # REMOVED - conflicting with v1 API
app.include_router(api_router, prefix="/api/v1")
