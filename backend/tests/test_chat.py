"""Tests for the AI chat endpoints.

The provider call is mocked (``_generate_stream`` is monkeypatched) so no
network or API key is required to run these tests.
"""

import json

import pytest

from api.endpoints import chat
from core.rate_limit import limiter

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _reset_counters():
    """Reset both the daily counter and the per-minute slowapi storage.

    Without this, rapid-fire chat tests trip the shared 10/min limiter (keyed
    by the ``testclient`` IP across the whole session).
    """
    chat._daily.reset()
    limiter.reset()
    yield
    chat._daily.reset()
    limiter.reset()


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
    assert "gemini-2.5-flash" in ids
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


# ---------------------------------------------------------------------------
# Daily caps (CHAT_DAILY_GLOBAL_LIMIT / CHAT_DAILY_PER_IP_LIMIT)
# ---------------------------------------------------------------------------


def test_chat_429_when_global_daily_limit_reached(client, with_gemini_key, monkeypatch):
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_GLOBAL_LIMIT", 1)
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_PER_IP_LIMIT", 100)
    monkeypatch.setattr(chat, "_generate_stream", _fake_stream)

    first = client.post("/api/chat", json={"message": "hi"})
    assert first.status_code == 200

    second = client.post("/api/chat", json={"message": "again"})
    assert second.status_code == 429
    assert "daily chat budget" in second.json()["detail"]
    assert "Retry-After" in second.headers


def test_chat_429_when_per_ip_daily_limit_reached(client, with_gemini_key, monkeypatch):
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_GLOBAL_LIMIT", 100)
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_PER_IP_LIMIT", 1)
    monkeypatch.setattr(chat, "_generate_stream", _fake_stream)

    first = client.post("/api/chat", json={"message": "hi"})
    assert first.status_code == 200

    second = client.post("/api/chat", json={"message": "again"})
    assert second.status_code == 429
    assert "daily chat limit" in second.json()["detail"]
    assert "Retry-After" in second.headers


def test_per_ip_rejection_does_not_consume_global_budget(client, with_gemini_key, monkeypatch):
    # Global limit of 2, per-IP limit of 1. After the first (allowed) request
    # from the test client IP, a second should hit the per-IP cap — but the
    # global budget should NOT be consumed by that rejected request, leaving
    # room for a request from a different IP.
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_GLOBAL_LIMIT", 2)
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_PER_IP_LIMIT", 1)
    monkeypatch.setattr(chat, "_generate_stream", _fake_stream)

    first = client.post("/api/chat", json={"message": "hi"})
    assert first.status_code == 200

    rejected = client.post("/api/chat", json={"message": "again"})
    assert rejected.status_code == 429

    # The global counter should still have one slot left (the rejected request
    # rolled back its global increment).
    assert chat._daily._counts[chat._GLOBAL_KEY] == 1


def test_daily_limit_zero_disables_cap(client, with_gemini_key, monkeypatch):
    # A limit of 0 disables the check entirely, so many requests should succeed.
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_GLOBAL_LIMIT", 0)
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_PER_IP_LIMIT", 0)
    monkeypatch.setattr(chat, "_generate_stream", _fake_stream)

    for _ in range(5):
        response = client.post("/api/chat", json={"message": "hi"})
        assert response.status_code == 200


def test_missing_provider_key_does_not_burn_daily_cap(client, no_keys, monkeypatch):
    # With no keys configured, _get_client raises 503 before caps are checked.
    # The daily counters should remain untouched.
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_GLOBAL_LIMIT", 1)
    monkeypatch.setattr(chat.settings, "CHAT_DAILY_PER_IP_LIMIT", 1)

    response = client.post("/api/chat", json={"message": "hi"})
    assert response.status_code == 503

    # Global and per-IP counters should still be empty.
    assert chat._daily._counts.get(chat._GLOBAL_KEY, 0) == 0


# ---------------------------------------------------------------------------
# _DailyCounter unit tests
# ---------------------------------------------------------------------------


def test_daily_counter_resets_on_utc_day_rollover(monkeypatch):
    counter = chat._DailyCounter()

    # Pin "today" to a fixed past date so the seeded count isn't auto-cleared.
    monkeypatch.setattr(chat, "_utc_today", lambda: "2000-01-01")
    counter._day = "2000-01-01"
    counter._counts = {chat._GLOBAL_KEY: 1}

    # Same day → at limit, request rejected.
    assert counter.check_and_increment(chat._GLOBAL_KEY, 1) is False

    # Roll "today" forward → _maybe_roll clears the bucket, request allowed.
    monkeypatch.setattr(chat, "_utc_today", lambda: "2000-01-02")
    assert counter.check_and_increment(chat._GLOBAL_KEY, 1) is True


def test_daily_counter_decrement_clamps_at_zero():
    counter = chat._DailyCounter()
    # Decrementing an empty counter is a no-op (clamps, never negative).
    counter.decrement(chat._GLOBAL_KEY)
    assert counter._counts.get(chat._GLOBAL_KEY, 0) == 0

    # Increment then decrement returns to zero.
    counter.check_and_increment(chat._GLOBAL_KEY, 5)
    assert counter._counts[chat._GLOBAL_KEY] == 1
    counter.decrement(chat._GLOBAL_KEY)
    assert counter._counts[chat._GLOBAL_KEY] == 0


def test_seconds_to_utc_midnight_is_positive():
    seconds = chat._seconds_to_utc_midnight()
    assert isinstance(seconds, int)
    assert 0 < seconds <= 86400  # between 0 and 24 hours

