from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    techStack: list[str]
    githubUrl: Optional[str] = None
    liveUrl: Optional[str] = None
    featured: bool
