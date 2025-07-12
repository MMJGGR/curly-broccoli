import os
import uuid
from fastapi import FastAPI, Request, Response


class TraceMiddleware:
    """Simple middleware adding a unique trace ID to each response."""

    def __call__(self, request: Request, call_next):
        trace_id = str(uuid.uuid4())
        request.state.trace_id = trace_id
        response = call_next(request)
        if isinstance(response, Response):
            response.headers["X-Trace-ID"] = trace_id
            return response
        return Response(response, headers={"X-Trace-ID": trace_id})
from .database import Base, engine
from .auth import router as auth_router
from .profile import router as profile_router

Base.metadata.create_all(bind=engine)
from pydantic import BaseModel
from compute.operations import add

app = FastAPI(title=os.getenv("APP_NAME", "FastAPI App"))
app.add_middleware(TraceMiddleware)


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
