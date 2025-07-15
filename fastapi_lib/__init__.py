from __future__ import annotations
from types import SimpleNamespace
from typing import Callable, Dict, Tuple, Any, Type
import inspect
import asyncio

class HTTPException(Exception):
    def __init__(self, status_code: int, detail: str = ""):
        self.status_code = status_code
        self.detail = detail

class status:
    HTTP_200_OK = 200
    HTTP_201_CREATED = 201
    HTTP_400_BAD_REQUEST = 400
    HTTP_401_UNAUTHORIZED = 401
    HTTP_404_NOT_FOUND = 404

class Depends:
    def __init__(self, dependency: Callable | None = None):
        self.dependency = dependency

class Request:
    def __init__(self, json: Dict[str, Any] | None = None, data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None):
        self.json = json or {}
        self.data = data or {}
        self.headers = headers or {}
        self.state = SimpleNamespace()

class Response:
    def __init__(self, content: Any, status_code: int = 200, headers: Dict[str, str] | None = None):
        self.content = content
        self.status_code = status_code
        self.headers = headers or {}
    def json(self):
        import dataclasses
        if dataclasses.is_dataclass(self.content):
            return dataclasses.asdict(self.content)
        if hasattr(self.content, "__dict__"):
            return {k: v for k, v in self.content.__dict__.items() if not k.startswith("_")}
        return self.content

class APIRouter:
    def __init__(self, prefix: str = "", tags: list[str] | None = None):
        self.prefix = prefix
        self.routes: Dict[Tuple[str, str], Tuple[Callable, int]] = {}
    def get(self, path: str, **kwargs):
        def decorator(func: Callable):
            status_code = kwargs.get("status_code", 200)
            self.routes[("GET", self.prefix + path)] = (func, status_code)
            return func
        return decorator
    def post(self, path: str, **kwargs):
        def decorator(func: Callable):
            status_code = kwargs.get("status_code", 200)
            self.routes[("POST", self.prefix + path)] = (func, status_code)
            return func
        return decorator

    def put(self, path: str, **kwargs):
        def decorator(func: Callable):
            status_code = kwargs.get("status_code", 200)
            self.routes[("PUT", self.prefix + path)] = (func, status_code)
            return func
        return decorator

    def delete(self, path: str, **kwargs):
        def decorator(func: Callable):
            status_code = kwargs.get("status_code", 200)
            self.routes[("DELETE", self.prefix + path)] = (func, status_code)
            return func
        return decorator

class FastAPI(APIRouter):
    def __init__(self, title: str = ""):
        super().__init__(prefix="")
        self.title = title
        self._middleware: list[Any] = []

    def include_router(self, router: APIRouter):
        self.routes.update(router.routes)

    def add_middleware(self, middleware_class: Type, **kwargs):
        """Register a middleware instance to run on each request."""
        try:
            self._middleware.append(middleware_class(self, **kwargs))
        except TypeError:
            self._middleware.append(middleware_class(**kwargs))

    def middleware(self, type_: str):
        if type_ != "http":
            raise NotImplementedError("Only 'http' middleware supported")
        def decorator(func: Callable[[Request, Callable[[Request], Response]], Any]):
            self.add_middleware(FunctionMiddleware, func=func)
            return func
        return decorator


class CORSMiddleware:
    """Very small stub of FastAPI's CORSMiddleware for tests."""

    def __init__(self,
                 allow_origins=None,
                 allow_methods=None,
                 allow_headers=None,
                 allow_credentials: bool = False):
        self.allow_origins = allow_origins or ["*"]
        self.allow_methods = allow_methods or ["*"]
        self.allow_headers = allow_headers or ["*"]
        self.allow_credentials = allow_credentials

    def __call__(self, request: Request, call_next: Callable[[Request], Response]):
        response = call_next(request)
        if isinstance(response, Response):
            response.headers["access-control-allow-origin"] = ",".join(self.allow_origins)
            response.headers["access-control-allow-methods"] = ",".join(self.allow_methods)
            response.headers["access-control-allow-headers"] = ",".join(self.allow_headers)
            if self.allow_credentials:
                response.headers["access-control-allow-credentials"] = "true"
        return response


class FunctionMiddleware:
    """Wrap a function-style middleware for the TestClient."""

    def __init__(self, func: Callable[[Request, Callable[[Request], Response]], Any]):
        self.func = func

    def __call__(self, request: Request, call_next: Callable[[Request], Response]):
        result = self.func(request, call_next)
        if inspect.isawaitable(result):
            result = asyncio.run(result)
        return result
