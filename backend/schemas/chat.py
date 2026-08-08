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
