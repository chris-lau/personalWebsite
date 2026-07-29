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
