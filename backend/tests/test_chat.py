"""Tests for the AI chat endpoints.

The provider call is mocked (``_generate_stream`` is monkeypatched) so no
network or API key is required to run these tests.

Test strategy (Phase 1f):

1. **Event-shape tests** monkeypatch ``_generate_stream`` and assert the SSE
   wire format (tokens, meta, meta_server, usage, done arrive in order).

2. **Provider-aware ``stream_options`` + usage extraction tests** mock
   ``_get_client`` (NOT ``_generate_stream``) so the real generator body runs.
   This lets us assert on the ``create(...)`` kwargs and observe usage-chunk
   extraction without hitting the network.
"""

import json
import time
from types import SimpleNamespace

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
def with_all_keys(monkeypatch):
    """Configure all provider keys for cross-provider tests."""
    monkeypatch.setattr(chat.settings, "GEMINI_API_KEY", "test-gemini-key")
    monkeypatch.setattr(chat.settings, "DEEPSEEK_API_KEY", "test-deepseek-key")
    monkeypatch.setattr(chat.settings, "OPENAI_API_KEY", "test-openai-key")


@pytest.fixture
def no_keys(monkeypatch):
    """Disable all provider keys to exercise the 503 path."""
    monkeypatch.setattr(chat.settings, "GEMINI_API_KEY", "")
    monkeypatch.setattr(chat.settings, "DEEPSEEK_API_KEY", "")
    monkeypatch.setattr(chat.settings, "OPENAI_API_KEY", "")


# ---------------------------------------------------------------------------
# Fake generators (event-shape tests monkeypatch _generate_stream)
# ---------------------------------------------------------------------------


async def _fake_stream(*args, **kwargs):
    """Drop-in for ``_generate_stream`` that yields structured event dicts."""
    yield {"token": "Hello"}
    yield {"token": ", "}
    yield {"token": "world!"}
    yield {"meta": {"finish_reason": "stop", "model": "gemini-2.0-flash"}}
    yield {"meta_server": {"server_pre_llm_ms": 2.1, "server_llm_to_first_token_ms": 180.4}}
    yield {"usage": {"prompt_tokens": 100, "completion_tokens": 5, "total_tokens": 105}}


# ---------------------------------------------------------------------------
# Helpers for client-mock tests (provider-aware stream_options + usage)
# ---------------------------------------------------------------------------


def _make_fake_chunk(content=None, finish_reason=None, usage=None, empty_choices=False):
    """Build a lightweight fake ``ChatCompletionChunk``-like object."""
    if empty_choices:
        choices = []
    elif content is not None or finish_reason is not None:
        delta = SimpleNamespace(content=content)
        choices = [SimpleNamespace(delta=delta, finish_reason=finish_reason)]
    else:
        choices = []
    return SimpleNamespace(choices=choices, usage=usage)


class _AsyncChunks:
    """A lightweight async iterator wrapping a list of fake chunks."""

    def __init__(self, chunks):
        self._chunks = chunks

    def __aiter__(self):
        return self

    async def __anext__(self):
        if not self._chunks:
            raise StopAsyncIteration
        return self._chunks.pop(0)


def _make_fake_client(chunks, captured):
    """Return a fake ``AsyncOpenAI`` whose ``create`` yields *chunks*.

    ``captured`` is a dict that will be populated with the ``kwargs`` passed
    to ``create()`` so tests can assert on them.
    """

    async def _fake_create(**kwargs):
        captured.update(kwargs)
        return _AsyncChunks(chunks)

    completions = SimpleNamespace(create=_fake_create)
    return SimpleNamespace(chat=SimpleNamespace(completions=completions))


async def _collect_stream_events(model_id, chunks, monkeypatch):
    """Run the real ``_generate_stream`` with a fake client, collecting events.

    Returns the list of yielded dicts.
    """
    captured_kwargs: dict = {}
    fake_client = _make_fake_client(chunks, captured_kwargs)
    monkeypatch.setattr(chat, "_get_client", lambda m: fake_client)

    events = []
    async for event in chat._generate_stream(
        fake_client, model_id, "test system prompt", [], "hello",
        request_start=time.monotonic(),
    ):
        events.append(event)
    return events, captured_kwargs


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
# POST /api/chat — event-shape tests (monkeypatch _generate_stream)
# ---------------------------------------------------------------------------


def test_chat_streams_structured_events(client, with_gemini_key, monkeypatch):
    """Tokens, meta, meta_server, usage, and done all arrive in order."""
    monkeypatch.setattr(chat, "_generate_stream", _fake_stream)

    response = client.post(
        "/api/chat",
        json={"message": "What does Chris write about?"},
    )
    assert response.status_code == 200

    # Parse the SSE stream: collect all event payloads.
    events: list[dict] = []
    for line in response.text.splitlines():
        if line.startswith("data: "):
            events.append(json.loads(line[len("data: "):]))

    # Token events
    tokens = [e["token"] for e in events if "token" in e]
    assert "".join(tokens) == "Hello, world!"

    # Meta event
    meta_events = [e["meta"] for e in events if "meta" in e]
    assert len(meta_events) == 1
    assert meta_events[0]["finish_reason"] == "stop"
    assert meta_events[0]["model"] == "gemini-2.0-flash"

    # Meta_server event
    server_events = [e["meta_server"] for e in events if "meta_server" in e]
    assert len(server_events) == 1
    assert server_events[0]["server_pre_llm_ms"] == pytest.approx(2.1)
    assert server_events[0]["server_llm_to_first_token_ms"] == pytest.approx(180.4)

    # Usage event
    usage_events = [e["usage"] for e in events if "usage" in e]
    assert len(usage_events) == 1
    assert usage_events[0]["prompt_tokens"] == 100
    assert usage_events[0]["completion_tokens"] == 5
    assert usage_events[0]["total_tokens"] == 105

    # Done sentinel (must be last)
    assert events[-1] == {"done": True}

    # Event order: all tokens first, then meta, then meta_server, then usage,
    # then done.
    event_types = []
    for e in events:
        if "token" in e:
            event_types.append("token")
        elif "meta" in e:
            event_types.append("meta")
        elif "meta_server" in e:
            event_types.append("meta_server")
        elif "usage" in e:
            event_types.append("usage")
        elif "done" in e:
            event_types.append("done")
    assert event_types == [
        "token", "token", "token",
        "meta", "meta_server", "usage",
        "done",
    ]


def test_chat_emits_error_chunk_on_provider_failure(client, with_gemini_key, monkeypatch):
    async def failing_stream(*args, **kwargs):
        raise RuntimeError("upstream blew up")
        yield  # pragma: no cover — generator marker

    monkeypatch.setattr(chat, "_generate_stream", failing_stream)

    response = client.post("/api/chat", json={"message": "hi"})
    assert response.status_code == 200  # headers already sent
    assert '"error"' in response.text


def test_chat_rejects_empty_message(client, with_gemini_key):
    # FastAPI returns 422 when min_length=1 is violated.
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422


def test_chat_503_when_no_keys_configured(client, no_keys):
    response = client.post("/api/chat", json={"message": "hello"})
    assert response.status_code == 503


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


# ---------------------------------------------------------------------------
# Provider-aware stream_options tests (mock _get_client, NOT _generate_stream)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_openai_includes_stream_options(monkeypatch):
    """OpenAI provider should pass ``stream_options={"include_usage": True}``."""
    chunks = [_make_fake_chunk(content="Hi", finish_reason="stop")]
    _, kwargs = await _collect_stream_events("gpt-4o-mini", chunks, monkeypatch)
    assert kwargs.get("stream_options") == {"include_usage": True}


@pytest.mark.asyncio
async def test_deepseek_includes_stream_options(monkeypatch):
    """DeepSeek provider should pass ``stream_options={"include_usage": True}``."""
    chunks = [_make_fake_chunk(content="Hi", finish_reason="stop")]
    _, kwargs = await _collect_stream_events("deepseek-chat", chunks, monkeypatch)
    assert kwargs.get("stream_options") == {"include_usage": True}


@pytest.mark.asyncio
async def test_gemini_omits_stream_options(monkeypatch):
    """Gemini provider should NOT pass ``stream_options`` (it 400s)."""
    chunks = [_make_fake_chunk(content="Hi", finish_reason="stop")]
    _, kwargs = await _collect_stream_events("gemini-2.0-flash", chunks, monkeypatch)
    assert "stream_options" not in kwargs


@pytest.mark.asyncio
async def test_gemini_25_flash_omits_stream_options(monkeypatch):
    """Gemini 2.5 Flash should also omit ``stream_options``."""
    chunks = [_make_fake_chunk(content="Hi", finish_reason="stop")]
    _, kwargs = await _collect_stream_events("gemini-2.5-flash", chunks, monkeypatch)
    assert "stream_options" not in kwargs


# ---------------------------------------------------------------------------
# Usage extraction tests (mock _get_client)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_usage_extracted_from_empty_choices_chunk(monkeypatch):
    """The final chunk with ``choices=[]`` + ``usage`` should be yielded."""
    usage_obj = SimpleNamespace(prompt_tokens=50, completion_tokens=10, total_tokens=60)
    chunks = [
        _make_fake_chunk(content="Hi"),
        _make_fake_chunk(content=" there", finish_reason="stop"),
        _make_fake_chunk(empty_choices=True, usage=usage_obj),
    ]
    events, _ = await _collect_stream_events("gpt-4o-mini", chunks, monkeypatch)

    # Tokens
    assert [e["token"] for e in events if "token" in e] == ["Hi", " there"]

    # Meta
    meta = [e["meta"] for e in events if "meta" in e]
    assert len(meta) == 1
    assert meta[0]["finish_reason"] == "stop"

    # Usage
    usage_events = [e["usage"] for e in events if "usage" in e]
    assert len(usage_events) == 1
    assert usage_events[0]["prompt_tokens"] == 50
    assert usage_events[0]["completion_tokens"] == 10
    assert usage_events[0]["total_tokens"] == 60


@pytest.mark.asyncio
async def test_no_usage_when_not_reported(monkeypatch):
    """If no chunk carries usage data, no ``usage`` event should be emitted."""
    chunks = [
        _make_fake_chunk(content="Hi", finish_reason="stop"),
    ]
    events, _ = await _collect_stream_events("gemini-2.0-flash", chunks, monkeypatch)

    assert not any("usage" in e for e in events)
    # But meta_server and meta should still be present
    assert any("meta_server" in e for e in events)
    assert any("meta" in e for e in events)


@pytest.mark.asyncio
async def test_openai_no_usage_chunk_graceful(monkeypatch):
    """OpenAI sent ``stream_options`` but the provider returned no usage chunk —
    should emit tokens + meta + meta_server with no crash and no ``usage`` event."""
    chunks = [
        _make_fake_chunk(content="Hi", finish_reason="stop"),
        # No trailing empty-choices chunk with usage — provider may drop it.
    ]
    events, kwargs = await _collect_stream_events("gpt-4o-mini", chunks, monkeypatch)

    # stream_options was sent
    assert kwargs.get("stream_options") == {"include_usage": True}
    # Tokens arrived
    assert [e["token"] for e in events if "token" in e] == ["Hi"]
    # No usage event — provider didn't send one
    assert not any("usage" in e for e in events)
    # Meta and meta_server still emitted
    assert any("meta" in e for e in events)
    assert any("meta_server" in e for e in events)


# ---------------------------------------------------------------------------
# Server timing tests (mock _get_client)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_meta_server_contains_both_segments(monkeypatch):
    """``meta_server`` should carry ``server_pre_llm_ms`` and ``server_llm_to_first_token_ms``."""
    chunks = [_make_fake_chunk(content="Hi", finish_reason="stop")]
    events, _ = await _collect_stream_events("gpt-4o-mini", chunks, monkeypatch)

    server_events = [e["meta_server"] for e in events if "meta_server" in e]
    assert len(server_events) == 1
    assert server_events[0]["server_pre_llm_ms"] is not None
    assert server_events[0]["server_llm_to_first_token_ms"] is not None
    # Both should be non-negative numbers (ms)
    assert server_events[0]["server_pre_llm_ms"] >= 0
    assert server_events[0]["server_llm_to_first_token_ms"] >= 0


@pytest.mark.asyncio
async def test_meta_server_emitted_even_with_empty_stream(monkeypatch):
    """``meta_server`` is always emitted — ``server_pre_llm_ms`` is pre-calculated."""
    events, _ = await _collect_stream_events("gemini-2.0-flash", [], monkeypatch)

    server_events = [e["meta_server"] for e in events if "meta_server" in e]
    assert len(server_events) == 1
    assert server_events[0]["server_pre_llm_ms"] >= 0
    # No chunks arrived, so llm-to-first-token should be None
    assert server_events[0]["server_llm_to_first_token_ms"] is None


@pytest.mark.asyncio
async def test_meta_always_emitted_even_without_finish_reason(monkeypatch):
    """``meta`` event is always emitted, defaulting ``finish_reason`` to ``"unknown"``."""
    chunks = [_make_fake_chunk(content="Hi")]
    events, _ = await _collect_stream_events("gemini-2.0-flash", chunks, monkeypatch)

    meta_events = [e["meta"] for e in events if "meta" in e]
    assert len(meta_events) == 1
    assert meta_events[0]["finish_reason"] == "unknown"
    assert meta_events[0]["model"] == "gemini-2.0-flash"


def test_provider_for_model_defaults_to_gemini_on_unrecognized(client, monkeypatch):
    """Unrecognized model that also matches default should not recurse infinitely."""
    monkeypatch.setattr(chat.settings, "CHAT_DEFAULT_MODEL", "nonexistent-model")
    # Should return "gemini" (safe fallback) instead of RecursionError
    assert chat._provider_for_model("nonexistent-model") == "gemini"


def test_provider_for_model_falls_back_to_default_provider(client, monkeypatch):
    """Recognized default model is used as fallback for unknown model ids."""
    monkeypatch.setattr(chat.settings, "CHAT_DEFAULT_MODEL", "gemini-2.5-flash")
    # Unknown model falls back to gemini's provider
    assert chat._provider_for_model("totally-unknown-model") == "gemini"


# ---------------------------------------------------------------------------
# Grounding context tests
# ---------------------------------------------------------------------------


def test_system_prompt_includes_projects_skills_and_now():
    """The grounding context must cover projects/skills/now/architecture so starter-chip
    and companion-mode questions answer well."""
    chat._build_context.cache_clear()
    prompt = chat._build_system_prompt()

    # The JSON data files are embedded in the context.
    assert "projects.json (JSON)" in prompt
    assert "skills.json (JSON)" in prompt
    assert "now.json (JSON)" in prompt
    assert "site_architecture.json (JSON)" in prompt

    # Spot-check real content from each source.
    assert "Multi-Agent System Platform" in prompt  # projects.json title
    assert "Amazon Seller Trend & Opportunity Suite" in prompt  # projects.json & architecture
    assert "Product & Leadership" in prompt  # skills.json category
    assert "AI Surveillance" in prompt  # now.json currentFocus


def test_system_prompt_link_allowlist_guidance():
    """The system prompt must restrict links to the allowed site routes."""
    prompt = chat._build_system_prompt()
    for route in ("/about", "/projects", "/now", "/experience", "/guidebook", "/blog/{slug}", "/amazon-tools"):
        assert route in prompt
    # Guardrail against hallucinated URLs must be present.
    assert "Do NOT link to routes other than" in prompt
