"""Pydantic models for the AI chat endpoints.

All fields use ``Optional[...]`` / ``List[...]`` rather than ``X | None`` /
``list[X]``: the venv is Python 3.9 and Pydantic v2 evaluates annotations at
runtime for validation, so the older typing syntax is the safe choice.
"""

from typing import Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single message in the conversation history."""

    role: str = Field(..., description="One of 'user', 'assistant', or 'system'")
    content: str = Field(..., description="The message text")


class ChatRequest(BaseModel):
    """Inbound payload for POST /api/chat."""

    message: str = Field(..., min_length=1, max_length=2000, description="The new user message")
    history: list[ChatMessage] = Field(default_factory=list, description="Prior conversation turns")
    model: Optional[str] = Field(default=None, description="Model id; falls back to CHAT_DEFAULT_MODEL")


class ChatModelInfo(BaseModel):
    """A selectable model in the UI switcher."""

    id: str = Field(..., description="Model id sent back in ChatRequest.model")
    label: str = Field(..., description="Human-readable name shown in the dropdown")
    provider: str = Field(..., description="Provider key: 'gemini', 'deepseek', or 'openai'")


class ChatModelsResponse(BaseModel):
    """Response for GET /api/chat/models — only models with a configured key are listed."""

    models: list[ChatModelInfo]
    default_model: str


class ChatSourceItem(BaseModel):
    """A grounding source document fed into the chat system prompt."""

    id: str = Field(..., description="Unique identifier for the source")
    title: str = Field(..., description="Display title for the source")
    category: str = Field(..., description="Category: blog, guidebook, profile, experience, projects, skills, now, architecture, amazon")
    source_file: str = Field(..., description="File origin or schema name")
    route: Optional[str] = Field(default=None, description="Site route if applicable (e.g. /blog/xyz)")
    char_count: int = Field(..., description="Character length of the source content")
    estimated_tokens: int = Field(..., description="Estimated token count (~4 chars per token)")
    content: str = Field(..., description="Full text or JSON string of the source")


class ChatSourcesResponse(BaseModel):
    """Response for GET /api/chat/sources."""

    sources: list[ChatSourceItem]
    total_sources: int
    total_characters: int
    total_estimated_tokens: int

