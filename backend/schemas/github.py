from typing import Optional

from pydantic import BaseModel, Field


class LanguageStat(BaseModel):
    """Per-language repo count statistics."""

    language: str = Field(..., description="Programming language name")
    count: int = Field(..., description="Number of non-fork repos with this primary language")
    percentage: int = Field(..., description="Percentage of total repos")
    color: str = Field(..., description="Hex color for the language")


class GitHubUserSummary(BaseModel):
    """Transformed GitHub user view model (server-side proxy response)."""

    username: str
    displayName: str
    avatarUrl: str
    profileUrl: str
    bio: str
    publicRepos: int
    followers: int
    following: int
    location: Optional[str] = None
    blogUrl: Optional[str] = None
    topLanguages: list[LanguageStat] = Field(default_factory=list)


class GitHubRepoSummary(BaseModel):
    """Transformed GitHub repository view model."""

    id: int
    name: str
    fullName: str
    description: str
    githubUrl: str
    demoUrl: Optional[str] = None
    stars: int
    forks: int
    primaryLanguage: str
    topics: list[str] = Field(default_factory=list)
    isFork: bool
    updatedAt: str
    pushedAt: str
    formattedLastUpdated: str
    isRecentlyUpdated: bool


class GitHubSummaryResponse(BaseModel):
    """Combined user + repos response from the GitHub proxy endpoint."""

    user: GitHubUserSummary
    repos: list[GitHubRepoSummary]
    cached: bool = Field(default=False, description="Whether this response was served from cache")
