from fastapi.testclient import TestClient

# Fixtures are now in conftest.py


def test_healthz(client: TestClient):
    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "engines": {}}
    assert "X-Trace-ID" in resp.headers
