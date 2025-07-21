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
        import dataclasses
        if dataclasses.is_dataclass(self._content):
            return dataclasses.asdict(self._content)
        if hasattr(self._content, "__dict__"):
            return {k: v for k, v in self._content.__dict__.items() if not k.startswith("_")}
        return self._content

class TestClient:
    def __init__(self, app: FastAPI):
        self.app = app

    def get(self, path: str, headers: Dict[str, str] | None = None):
        return self.request("GET", path, headers=headers)

    def post(self, path: str, json: Dict[str, Any] | None = None, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None):
        return self.request("POST", path, json=json, data=data, headers=headers)

    def request(self, method: str, path: str, json: Dict[str, Any] | None = None, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None):
        route = self.app.routes.get((method, path))
        if route is None:
            return TestResponse(404, {"detail": "Not Found"}, {})
        handler, default_status = route

        request = Request(json=json, data=data, headers=headers or {})

        def resolve(dep: Callable) -> Any:
            sig2 = inspect.signature(dep)
            deps = {}
            for n2, p2 in sig2.parameters.items():
                if isinstance(p2.default, Depends):
                    inner = p2.default.dependency or p2.annotation
                    if inspect.signature(inner).parameters:
                        deps[n2] = resolve(inner)
                    else:
                        deps[n2] = inner()
                elif getattr(p2.annotation, '__name__', None) == 'Request' or p2.annotation == 'Request':
                    deps[n2] = request
                elif data is not None and (getattr(p2.annotation, '__name__', None) == 'OAuth2PasswordRequestForm' or p2.annotation == 'OAuth2PasswordRequestForm'):
                    deps[n2] = p2.annotation(Request(json=None, data=data))
                elif json is not None and p2.annotation not in (inspect._empty, Request):
                    ann = p2.annotation
                    from pydantic import BaseModel
                    if issubclass(ann, BaseModel):
                        deps[n2] = ann(**(json or {}))
                    elif n2 in json:
                        deps[n2] = json[n2]
            return dep(**deps)

        def call_endpoint(req: Request):
            kwargs = {}
            sig = inspect.signature(handler)
            for name, param in sig.parameters.items():
                if isinstance(param.default, Depends):
                    dep = param.default.dependency or param.annotation
                    if inspect.signature(dep).parameters:
                        kwargs[name] = resolve(dep)
                    else:
                        kwargs[name] = dep()
                elif getattr(param.annotation, '__name__', None) == 'Request' or param.annotation == 'Request':
                    kwargs[name] = req
                elif data is not None and (getattr(param.annotation, '__name__', None) == 'OAuth2PasswordRequestForm' or param.annotation == 'OAuth2PasswordRequestForm'):
                    kwargs[name] = param.annotation(Request(json=None, data=data))
                elif json is not None and param.annotation not in (inspect._empty, Request):
                    ann = param.annotation
                    from pydantic import BaseModel
                    if issubclass(ann, BaseModel):
                        kwargs[name] = ann(**(json or {}))
                    elif name in json:
                        kwargs[name] = json[name]
            result = handler(**kwargs)
            if not isinstance(result, Response):
                result = Response(result, status_code=default_status)
            return result

        call = call_endpoint
        for middleware in reversed(getattr(self.app, "_middleware", [])):
            next_call = call

            def call(req: Request, mw=middleware, nxt=next_call):
                return mw(req, nxt)

        try:
            result = call(request)
            return TestResponse(result.status_code, result.content, result.headers)
        except HTTPException as e:
            return TestResponse(e.status_code, {"detail": e.detail}, {})
