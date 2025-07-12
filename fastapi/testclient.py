from __future__ import annotations
import inspect
from typing import Any, Dict
from . import Request, Response, Depends, HTTPException, APIRouter, FastAPI

class TestResponse:
    def __init__(self, status_code: int, content: Any, headers: Dict[str, str]):
        self.status_code = status_code
        self._content = content
        self.headers = headers
    def json(self):
        return self._content

class TestClient:
    def __init__(self, app: FastAPI):
        self.app = app

    def get(self, path: str, headers: Dict[str, str] | None = None):
        return self.request("GET", path, headers=headers)

    def post(self, path: str, json: Dict[str, Any] | None = None, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None):
        return self.request("POST", path, json=json, data=data, headers=headers)

    def request(self, method: str, path: str, json: Dict[str, Any] | None = None, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None):
        handler = self.app.routes.get((method, path))
        if handler is None:
            return TestResponse(404, {"detail": "Not Found"}, {})
        request = Request(json=json, data=data, headers=headers or {})
        kwargs = {}
        sig = inspect.signature(handler)
        for name, param in sig.parameters.items():
            if isinstance(param.default, Depends):
                dep = param.default.dependency
                if inspect.signature(dep).parameters:
                    kwargs[name] = dep(request)
                else:
                    kwargs[name] = dep()
            elif param.annotation is Request:
                kwargs[name] = request
            elif data is not None and hasattr(param.annotation, '__name__') and param.annotation.__name__ == 'OAuth2PasswordRequestForm':
                kwargs[name] = param.annotation(Request(json=None, data=data))
            elif json is not None and param.annotation not in (inspect._empty, Request):
                ann = param.annotation
                from pydantic import BaseModel
                if issubclass(ann, BaseModel):
                    kwargs[name] = ann(**(json or {}))
                elif name in json:
                    kwargs[name] = json[name]
        try:
            result = handler(**kwargs)
            if isinstance(result, Response):
                return TestResponse(result.status_code, result.content, result.headers)
            return TestResponse(200, result, {})
        except HTTPException as e:
            return TestResponse(e.status_code, {"detail": e.detail}, {})
