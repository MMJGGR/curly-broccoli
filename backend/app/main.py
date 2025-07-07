from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI(title=os.getenv("APP_NAME", "FastAPI App"))

class Message(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/echo")
def echo(msg: Message):
    return {"message": msg.message}
