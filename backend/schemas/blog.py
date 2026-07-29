from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class BlogPostMetaResponse(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    updatedDate: str
    readTime: str
    tags: list[str]
    author: str
    category: str
    featured: bool
    markdownFile: str


class BlogPostDetailResponse(BlogPostMetaResponse):
    content: Optional[str] = ""
