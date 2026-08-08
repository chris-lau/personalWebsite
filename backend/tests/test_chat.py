"""Tests for the AI chat endpoints.

The provider call is mocked (``_generate_stream`` is monkeypatched) so no
network or API key is required to run these tests.
"""

import json

import pytest

from api.endpoints import chat

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def with_gemini_key(monkeypatch):
    """Configure a Gemini API key so /chat/models reports it as available."""
    monkeypatch.setattr(chat.settings, "GEMINI_API_KEY", "test-gemini-key")
    monkeypatch.setattr(chat.settings, "DEEPSEEK_API_KEY", "")
    monkeypatch.setattr(chat.settings, "OPENAI_API_KEY", "")


@pytest.fixture
def no_keys(monkeypatch):
    """Disable all provider keys to exercise the 503 path."""
    monkeypatch.setattr(chat.settings, "GEMINI_API_KEY", "")
    monkeypatch.setattr(chat.settings, "DEEPSEEK_API_KEY", "")
    monkeypatch.setattr(chat.settings, "OPENAI_API_KEY", "")


async def _fake_stream(*args, **kwargs):
    """Drop-in for ``_generate_stream`` that yields canned tokens."""
    for token in ("Hello", ", ", "world!"):
        yield token


# ---------------------------------------------------------------------------
# GET /api/chat/models
# ---------------------------------------------------------------------------


def test_list_chat_models_returns_configured_models(client, with_gemini_key):
    response = client.get("/api/chat/models")
    assert response.status_code == 200
    body = response.json()
    assert body["default_model"] == chat.settings.CHAT_DEFAULT_MODEL
    ids = [m["id"] for m in body["models"]]
    assert "gemini-2.0-flash" in ids
    # DeepSeek/OpenAI are not configured, so they must not appear.
    assert not any(m["provider"] == "deepseek" for m in body["models"])
    assert not any(m["provider"] == "openai" for m in body["models"])


def test_list_chat_models_empty_when_no_keys(client, no_keys):
    response = client.get("/api/chat/models")
    assert response.status_code == 200
    assert response.json()["models"] == []


# ---------------------------------------------------------------------------
# POST /api/chat
# ---------------------------------------------------------------------------


def test_chat_streams_tokens(client, with_gemini_key, monkeypatch):
    monkeypatch.setattr(chat, "_generate_stream", _fake_stream)

    response = client.post(
        "/api/chat",
        json={"message": "What does Chris write about?"},
    )
    assert response.status_code == 200

    # Parse the SSE stream: collect data payloads.
    tokens = []
    saw_done = False
    for line in response.text.splitlines():
        if line.startswith("data: "):
            payload = json.loads(line[len("data: "):])
            if "token" in payload:
                tokens.append(payload["token"])
            elif payload.get("done"):
                saw_done = True

    assert "".join(tokens) == "Hello, world!"
    assert saw_done is True


def test_chat_rejects_empty_message(client, with_gemini_key):
    # FastAPI returns 422 when min_length=1 is violated.
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422


def test_chat_503_when_no_keys_configured(client, no_keys):
    response = client.post("/api/chat", json={"message": "hello"})
    assert response.status_code == 503


def test_chat_emits_error_chunk_on_provider_failure(client, with_gemini_key, monkeypatch):
    async def failing_stream(*args, **kwargs):
        raise RuntimeError("upstream blew up")
        yield  # pragma: no cover — generator marker

    monkeypatch.setattr(chat, "_generate_stream", failing_stream)

    response = client.post("/api/chat", json={"message": "hi"})
    assert response.status_code == 200  # headers already sent
    assert '"error"' in response.text
