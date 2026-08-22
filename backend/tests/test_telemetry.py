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
    # Database liveness probe should be present and healthy against the test DB.
    assert data["checks"]["database"]["status"] == "ok"
    assert data["checks"]["database"]["latency_ms"] >= 0


def test_health_ready_reports_degraded_when_db_unreachable(client, monkeypatch):
    """When the DB probe fails, /health/ready reports 'degraded' (not 500),
    since data endpoints fall back to static JSON."""
    from sqlalchemy.exc import OperationalError

    from api.endpoints import telemetry

    class _BrokenSession:
        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def execute(self, *args, **kwargs):
            raise OperationalError("SELECT 1", {}, Exception("simulated outage"))

        def close(self):
            pass

    def _broken_session_local():
        return _BrokenSession()

    monkeypatch.setattr(telemetry, "SessionLocal", _broken_session_local)

    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["checks"]["database"]["status"] == "unhealthy"
    assert "error" in data["checks"]["database"]


def test_api_telemetry(client):
    """Verify GET /api/telemetry returns process, cache, and rate limit telemetry."""
    response = client.get("/api/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "process" in data
    assert "cache" in data
    assert "rate_limit" in data
    assert "database" in data
    assert data["process"]["uptime_seconds"] >= 0
    assert data["process"]["memory_rss_mb"] > 0
    assert data["rate_limit"]["limit_per_minute"] == 60
    assert data["database"]["status"] == "ok"
    assert data["database"]["engine"] in ("postgresql", "sqlite")
