import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Pytest fixture providing a TestClient instance for testing FastAPI endpoints."""
    with TestClient(app) as test_client:
        yield test_client
