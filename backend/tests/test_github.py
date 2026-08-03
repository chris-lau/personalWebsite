"""Tests for the GitHub proxy endpoint.

Uses httpx's mock transport to avoid real network calls.
"""

import httpx

from api.endpoints.github import clear_github_cache


def _mock_github_responses():
    """Return a dict of URL -> JSON response body for the mock transport."""

    user_body = {
        "login": "test-user",
        "id": 1,
        "avatar_url": "https://avatars.githubusercontent.com/u/1",
        "html_url": "https://github.com/test-user",
        "name": "Test User",
        "bio": "A test user.",
        "public_repos": 10,
        "followers": 5,
        "following": 3,
        "location": "Earth",
        "blog": "https://test-user.dev",
    }

    repos_body = [
        {
            "id": 100,
            "name": "repo-one",
            "full_name": "test-user/repo-one",
            "html_url": "https://github.com/test-user/repo-one",
            "description": "First repo",
            "fork": False,
            "updated_at": "2026-07-15T00:00:00Z",
            "pushed_at": "2026-07-20T00:00:00Z",
            "homepage": "https://repo-one.dev",
            "stargazers_count": 42,
            "forks_count": 2,
            "language": "TypeScript",
            "topics": ["react", "typescript"],
        },
        {
            "id": 101,
            "name": "forked-repo",
            "full_name": "test-user/forked-repo",
            "html_url": "https://github.com/test-user/forked-repo",
            "description": "A fork",
            "fork": True,
            "updated_at": "2026-01-01T00:00:00Z",
            "pushed_at": "2026-01-01T00:00:00Z",
            "homepage": None,
            "stargazers_count": 0,
            "forks_count": 0,
            "language": "Python",
            "topics": [],
        },
    ]

    return user_body, repos_body


def _patch_httpx_success(monkeypatch):
    """Patch httpx.AsyncClient to return mocked GitHub responses."""
    user_body, repos_body = _mock_github_responses()

    def mock_handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        if "/users/test-user/repos" in url:
            return httpx.Response(200, json=repos_body)
        if url.endswith("/users/test-user"):
            return httpx.Response(200, json=user_body)
        return httpx.Response(404, json={"message": "Not Found"})

    original_init = httpx.AsyncClient.__init__

    def patched_init(self, *args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(mock_handler)
        original_init(self, *args, **kwargs)

    monkeypatch.setattr(httpx.AsyncClient, "__init__", patched_init)
    return user_body, repos_body


def test_github_summary_success(client, monkeypatch):
    """Verify the proxy returns transformed user + repos and excludes forks."""
    clear_github_cache()
    _patch_httpx_success(monkeypatch)

    response = client.get("/api/github-summary", params={"username": "test-user"})
    assert response.status_code == 200
    data = response.json()

    user = data["user"]
    assert user["username"] == "test-user"
    assert user["displayName"] == "Test User"
    assert user["followers"] == 5
    assert user["location"] == "Earth"

    repos = data["repos"]
    assert len(repos) == 1  # fork excluded
    assert repos[0]["name"] == "repo-one"
    assert repos[0]["stars"] == 42
    assert repos[0]["primaryLanguage"] == "TypeScript"
    assert repos[0]["isFork"] is False

    assert len(user["topLanguages"]) == 1
    assert user["topLanguages"][0]["language"] == "TypeScript"


def test_github_summary_caches(client, monkeypatch):
    """Verify the second call is served from cache (cached=True)."""
    clear_github_cache()
    _patch_httpx_success(monkeypatch)

    first = client.get("/api/github-summary", params={"username": "test-user"})
    assert first.status_code == 200
    assert first.json()["cached"] is False

    second = client.get("/api/github-summary", params={"username": "test-user"})
    assert second.status_code == 200
    assert second.json()["cached"] is True


def test_github_summary_user_not_found(client, monkeypatch):
    """Verify 404 when GitHub user does not exist."""
    clear_github_cache()

    def mock_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(404, json={"message": "Not Found"})

    original_init = httpx.AsyncClient.__init__

    def patched_init(self, *args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(mock_handler)
        original_init(self, *args, **kwargs)

    monkeypatch.setattr(httpx.AsyncClient, "__init__", patched_init)

    response = client.get("/api/github-summary", params={"username": "ghost"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_github_summary_rate_limited(client, monkeypatch):
    """Verify 403 when GitHub rate limit is exceeded."""
    clear_github_cache()

    def mock_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(403, json={"message": "Rate limit exceeded"})

    original_init = httpx.AsyncClient.__init__

    def patched_init(self, *args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(mock_handler)
        original_init(self, *args, **kwargs)

    monkeypatch.setattr(httpx.AsyncClient, "__init__", patched_init)

    response = client.get("/api/github-summary", params={"username": "test-user"})
    assert response.status_code == 403
    assert "rate limit" in response.json()["detail"].lower()


def test_github_summary_rejects_invalid_username(client):
    """Verify path validation rejects special characters."""
    response = client.get("/api/github-summary", params={"username": "evil/../path"})
    assert response.status_code == 422
