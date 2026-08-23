"""GitHub proxy endpoint.

Proxies GitHub REST API requests server-side so the frontend avoids the
unauthenticated 60 req/hr IP-shared limit. When ``GITHUB_TOKEN`` is set, the
authenticated 5000 req/hr budget is used. Results are cached in-memory for
15 minutes.
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone, timedelta

import httpx
from fastapi import APIRouter, HTTPException, Query
from starlette.requests import Request

from config import settings
from core.rate_limit import limiter
from schemas.github import (
    GitHubRepoSummary,
    GitHubSummaryResponse,
    GitHubUserSummary,
    LanguageStat,
)

router = APIRouter()

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"
CACHE_TTL_SECONDS = 15 * 60  # 15 minutes

# Language -> hex color (mirrors the frontend color map).
LANGUAGE_COLORS: dict[str, str] = {
    "TypeScript": "#3178c6",
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Shell": "#89e051",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "C": "#555555",
    "C++": "#f34b7d",
    "Java": "#b07219",
    "Ruby": "#701516",
}

# In-memory cache: { username: { "data": ..., "expires": epoch } }.
_cache: dict[str, dict] = {"hits": 0, "misses": 0, "entries": {}}


def _github_headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "personal-os-backend"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return headers


def _is_within_past_30_days(date_string: str) -> bool:
    if not date_string:
        return False
    try:
        date = datetime.fromisoformat(date_string.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return False
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    return date >= cutoff


def _format_relative_time(date_string: str) -> str:
    if not date_string:
        return "recently"
    try:
        date = datetime.fromisoformat(date_string.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return "recently"
    now = datetime.now(timezone.utc)
    diff = (now - date).total_seconds()
    if diff < 60:
        return "just now"
    if diff < 3600:
        return f"{int(diff // 60)}m ago"
    if diff < 86400:
        return f"{int(diff // 3600)}h ago"
    if diff < 2592000:
        return f"{int(diff // 86400)}d ago"
    if diff < 31536000:
        return f"{int(diff // 2592000)}mo ago"
    return f"{int(diff // 31536000)}y ago"


def _compute_language_stats(repos: list[dict]) -> list[LanguageStat]:
    counts: dict[str, int] = {}
    total = 0
    for repo in repos:
        lang = repo.get("language")
        if lang and not repo.get("fork"):
            counts[lang] = counts.get(lang, 0) + 1
            total += 1
    if total == 0:
        return []
    sorted_langs = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return [
        LanguageStat(
            language=lang,
            count=count,
            percentage=round((count / total) * 100),
            color=LANGUAGE_COLORS.get(lang, "#8b949e"),
        )
        for lang, count in sorted_langs
    ]


def _transform_repo(raw: dict) -> GitHubRepoSummary:
    pushed_at = raw.get("pushed_at", "")
    updated_at = raw.get("updated_at", "")
    recently_updated = _is_within_past_30_days(pushed_at) or _is_within_past_30_days(updated_at)
    homepage = raw.get("homepage") or ""
    return GitHubRepoSummary(
        id=raw["id"],
        name=raw["name"],
        fullName=raw["full_name"],
        description=raw.get("description") or "No description provided.",
        githubUrl=raw["html_url"],
        demoUrl=homepage.strip() if homepage.strip() else None,
        stars=raw.get("stargazers_count", 0),
        forks=raw.get("forks_count", 0),
        primaryLanguage=raw.get("language") or "Markdown",
        topics=raw.get("topics") or [],
        isFork=raw.get("fork", False),
        updatedAt=updated_at,
        pushedAt=pushed_at,
        formattedLastUpdated=_format_relative_time(pushed_at or updated_at),
        isRecentlyUpdated=recently_updated,
    )


async def _fetch_github_summary(username: str) -> GitHubSummaryResponse:
    """Fetch user + repos from GitHub and transform into view models."""
    headers = _github_headers()
    async with httpx.AsyncClient(timeout=10.0) as client:
        user_resp = await client.get(
            f"{GITHUB_API_BASE}/users/{username}", headers=headers
        )
        if user_resp.status_code == 404:
            raise HTTPException(status_code=404, detail=f'GitHub user "{username}" was not found.')
        if user_resp.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="GitHub API rate limit exceeded. Please try again in a few minutes.",
            )
        if user_resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"GitHub user request failed (HTTP {user_resp.status_code}).",
            )
        raw_user = user_resp.json()

        repos_resp = await client.get(
            f"{GITHUB_API_BASE}/users/{username}/repos",
            params={"per_page": 100, "sort": "pushed"},
            headers=headers,
        )
        if repos_resp.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="GitHub API rate limit exceeded. Please try again in a few minutes.",
            )
        if repos_resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"GitHub repos request failed (HTTP {repos_resp.status_code}).",
            )
        raw_repos: list[dict] = repos_resp.json()

    user_model = GitHubUserSummary(
        username=raw_user["login"],
        displayName=raw_user.get("name") or raw_user["login"],
        avatarUrl=raw_user["avatar_url"],
        profileUrl=raw_user["html_url"],
        bio=raw_user.get("bio") or "Software developer & technology enthusiast.",
        publicRepos=raw_user.get("public_repos", 0),
        followers=raw_user.get("followers", 0),
        following=raw_user.get("following", 0),
        location=raw_user.get("location") or None,
        blogUrl=raw_user.get("blog") or None,
        topLanguages=_compute_language_stats(raw_repos),
    )
    repos = [_transform_repo(r) for r in raw_repos if not r.get("fork")]

    return GitHubSummaryResponse(user=user_model, repos=repos)


@router.get(
    "/github-summary",
    response_model=GitHubSummaryResponse,
    summary="Proxy GitHub user + repos summary (avoids client-side rate limits)",
)
@limiter.limit("30/minute")
async def get_github_summary(
    request: Request,
    username: str = Query(..., min_length=1, max_length=100, pattern=r"^[\w\-]+$"),
):
    # Check in-memory cache first.
    clean = username.strip().lower()
    entries: dict = _cache["entries"]
    cached = entries.get(clean)
    if cached and time.time() < cached["expires"]:
        _cache["hits"] += 1
        result = cached["data"]
        result.cached = True
        result.stale = False
        return result

    _cache["misses"] += 1
    try:
        result = await _fetch_github_summary(clean)
    except (HTTPException, httpx.HTTPError) as exc:
        # Stale-while-error: when the GitHub upstream is unavailable (rate
        # limit / 5xx / network error) serve the expired cache entry rather
        # than hard-failing clients. A 404 means the user genuinely does not
        # exist, so it is never masked by stale data.
        status_code = exc.status_code if isinstance(exc, HTTPException) else 502
        if cached and status_code != 404:
            logger.warning(
                "GitHub upstream failed (HTTP %s) — serving stale cache for %s",
                status_code,
                clean,
            )
            result = cached["data"]
            result.cached = True
            result.stale = True
            return result
        if not isinstance(exc, HTTPException):
            raise HTTPException(
                status_code=502, detail="GitHub upstream request failed."
            ) from exc
        raise

    entries[clean] = {"data": result, "expires": time.time() + CACHE_TTL_SECONDS}
    result.cached = False
    result.stale = False
    return result


def get_cache_stats() -> tuple[int, int]:
    """Return (hits, misses) for telemetry reporting."""
    return _cache["hits"], _cache["misses"]


def clear_github_cache() -> None:
    """Clear the in-memory GitHub cache (for testing)."""
    entries: dict = _cache["entries"]
    entries.clear()
    _cache["hits"] = 0
    _cache["misses"] = 0
