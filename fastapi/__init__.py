from __future__ import annotations
from types import SimpleNamespace
from typing import Callable, Dict, Tuple, Any, Type
import inspect

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
        return self.content

class APIRouter:
    def __init__(self, prefix: str = ""):
        self.prefix = prefix
        self.routes: Dict[Tuple[str, str], Callable] = {}
    def get(self, path: str, **kwargs):
        def decorator(func: Callable):
            self.routes[("GET", self.prefix + path)] = func
            return func
        return decorator
    def post(self, path: str, **kwargs):
        def decorator(func: Callable):
            self.routes[("POST", self.prefix + path)] = func
            return func
        return decorator

    def put(self, path: str, **kwargs):
        def decorator(func: Callable):
            self.routes[("PUT", self.prefix + path)] = func
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
        self._middleware.append(middleware_class(**kwargs))
