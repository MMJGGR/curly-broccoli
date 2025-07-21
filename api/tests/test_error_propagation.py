import os
from fastapi.testclient import TestClient

# ensure endpoints are registered before importing app
os.environ["ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app, Base, engine  # noqa: E402

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app, raise_server_exceptions=False)


def test_http_exception_propagates_trace_id():
    resp = client.get("/test-http-exception")
    assert resp.status_code == 418
    assert resp.json()["detail"] == "teapot"
    assert resp.headers["X-Trace-ID"] == resp.json()["trace_id"]


def test_unhandled_exception_propagates_trace_id():
    resp = client.get("/test-unhandled-exception")
    assert resp.status_code == 500
    assert resp.json()["detail"] == "Internal Server Error"
    assert resp.headers["X-Trace-ID"] == resp.json()["trace_id"]
