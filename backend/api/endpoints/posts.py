import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.blog import BlogPostDetailResponse, BlogPostMetaResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
POSTS_DIR = Path(__file__).resolve().parent.parent.parent / "posts"


@router.get("/posts", response_model=list[BlogPostMetaResponse], summary="List Blog Post Metadata")
def list_posts():
    posts_path = DATA_DIR / "blog_posts.json"
    if not posts_path.exists():
        raise HTTPException(status_code=404, detail="Blog post directory not found")
    with open(posts_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.get(
    "/posts/{slug}", response_model=BlogPostDetailResponse, summary="Get Blog Post Detail by Slug"
)
def get_post_by_slug(slug: str):
    posts = list_posts()
    post = next((p for p in posts if p["slug"] == slug), None)
    if not post:
        raise HTTPException(status_code=404, detail=f"Blog post with slug '{slug}' not found")

    markdown_file = post.get("markdownFile")
    content = ""
    if markdown_file:
        file_path = POSTS_DIR / markdown_file
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

    detail = dict(post)
    detail["content"] = content
    return detail
