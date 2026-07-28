def test_health_check_endpoint(client):
    """Verify GET /health returns HTTP 200 OK and expected status payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data
    assert data["service"] == "Personal OS FastAPI Backend"


def test_security_headers_present(client):
    """Verify responses include standard HTTP security headers."""
    response = client.get("/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


def test_cors_allowed_origin(client):
    """Verify requests with approved Origin header return Access-Control-Allow-Origin."""
    response = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
