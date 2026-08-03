def test_health_live(client):
    """Verify GET /api/health/live returns 200 status ok."""
    response = client.get("/api/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "timestamp" in data


def test_health_ready(client):
    """Verify GET /health/ready returns sub-system readiness checks."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "checks" in data
    assert "process_memory" in data["checks"]
    assert "process_uptime" in data["checks"]
    assert data["checks"]["process_memory"]["status"] == "ok"


def test_api_telemetry(client):
    """Verify GET /api/telemetry returns process, cache, and rate limit telemetry."""
    response = client.get("/api/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "process" in data
    assert "cache" in data
    assert "rate_limit" in data
    assert data["process"]["uptime_seconds"] >= 0
    assert data["process"]["memory_rss_mb"] > 0
    assert data["rate_limit"]["limit_per_minute"] == 60
