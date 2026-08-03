def test_correlation_id_generated(client):
    """Verify that a request without X-Request-ID gets a generated UUID X-Request-ID in response."""
    response = client.get("/health")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 10


def test_correlation_id_propagated(client):
    """Verify that a custom X-Request-ID is preserved in the response header."""
    custom_id = "test-correlation-id-12345"
    response = client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id


def test_cors_preflight_headers(client):
    """Verify CORS preflight OPTIONS request returns allowed origins headers."""
    response = client.options(
        "/api/projects",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_cors_preflight_production_origin(client):
    """Verify CORS preflight OPTIONS request for production domain https://chrislau.dev."""
    response = client.options(
        "/api/telemetry",
        headers={
            "Origin": "https://chrislau.dev",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://chrislau.dev"


def test_cors_preflight_cloudflare_pages_origin(client):
    """Verify CORS preflight OPTIONS request for Cloudflare Pages domain https://personalwebsite-8i8.pages.dev."""
    response = client.options(
        "/api/telemetry",
        headers={
            "Origin": "https://personalwebsite-8i8.pages.dev",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://personalwebsite-8i8.pages.dev"


def test_correlation_id_rejects_invalid_format(client):
    """Verify that a malformed X-Request-ID (CRLF injection attempt) is ignored and a fresh UUID generated."""
    # Contains a CRLF sequence — must not be echoed back verbatim (header injection).
    malicious = "abc\r\nX-Injected: evil"
    response = client.get("/health", headers={"X-Request-ID": malicious})
    assert response.status_code == 200
    echoed = response.headers.get("X-Request-ID", "")
    assert echoed != malicious
    # Should be a valid UUID-format string (generated fresh).
    assert len(echoed) >= 32


def test_correlation_id_rejects_oversized(client):
    """Verify that an overly long X-Request-ID is ignored."""
    oversized = "x" * 500
    response = client.get("/health", headers={"X-Request-ID": oversized})
    assert response.status_code == 200
    echoed = response.headers.get("X-Request-ID", "")
    assert echoed != oversized
    assert len(echoed) <= 128


def test_correlation_id_accepts_valid_format(client):
    """Verify that a well-formed X-Request-ID within the allowed charset is preserved."""
    valid_id = "req-abc-12345-67890"
    response = client.get("/health", headers={"X-Request-ID": valid_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == valid_id


