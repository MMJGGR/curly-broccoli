import os
import uuid
import inspect
from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, get_db, Session
from .auth import router as auth_router
from .profile import router as profile_router
from .models import User

# Create any tables that don’t yet exist
Base.metadata.create_all(bind=engine)

from pydantic import BaseModel
from compute.operations import add

app = FastAPI(title=os.getenv("APP_NAME", "FastAPI App"))

@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    trace_id = str(uuid.uuid4())
    request.state.trace_id = trace_id
    response = call_next(request)
    if inspect.isawaitable(response):
        response = await response
    if isinstance(response, Response):
        response.headers["X-Trace-ID"] = trace_id
        return response
    return Response(response, headers={"X-Trace-ID": trace_id})
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# Alias dependents routes without the /profile prefix for tests
from app.profile import (
    get_dependents,
    set_dependents,
    clear_dependents,
    get_current_user,
)
from app.schemas import Dependents

@app.get("/dependents", response_model=Dependents)
def get_deps(current: User = Depends(get_current_user)):
    return get_dependents(current)

@app.post("/dependents", response_model=Dependents)
def set_deps(data: Dependents, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    return set_dependents(data, db, current)

@app.delete("/dependents", response_model=Dependents)
def del_deps(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    return clear_dependents(db, current)
