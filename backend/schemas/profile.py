from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class SocialLink(BaseModel):
    platform: str
    url: str


class ProfileResponse(BaseModel):
    name: str
    handle: str
    title: str
    credentials: Optional[str] = None
    location: str
    bio: str
    avatarUrl: Optional[str] = None
    socials: list[SocialLink]
