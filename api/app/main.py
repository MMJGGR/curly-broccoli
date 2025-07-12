import logging
import os
import uuid
from fastapi import FastAPI, Request
from sqlalchemy.orm import Session
from starlette.middleware.tracing import TraceMiddleware
from .database import Base, engine
from .auth import router as auth_router
from .profile import router as profile_router
from fastapi.responses import JSONResponse

Base.metadata.create_all(bind=engine)
from pydantic import BaseModel
from compute.operations import add

logger = logging.getLogger("uvicorn")

app = FastAPI(title=os.getenv("APP_NAME", "FastAPI App"))
app.add_middleware(TraceMiddleware)


@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    trace_id = str(uuid.uuid4())
    request.state.trace_id = trace_id
    response = await call_next(request)
    response.headers["X-Trace-ID"] = trace_id
    logger.info("%s %s %s", request.method, request.url.path, trace_id)
    return response


class Message(BaseModel):
    message: str


@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/healthz")
def healthz():
    """Return engine status matrix."""
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


app.include_router(auth_router)
app.include_router(profile_router)
