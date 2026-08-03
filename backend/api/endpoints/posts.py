from fastapi import APIRouter, HTTPException, Path

from schemas.blog import BlogPostDetailResponse, BlogPostMetaResponse

from ._data import POSTS_DIR, find_by, load_json

router = APIRouter()


@router.get("/posts", response_model=list[BlogPostMetaResponse], summary="List Blog Post Metadata")
def list_posts():
    try:
        return load_json("blog_posts.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Blog post directory not found")


@router.get(
    "/posts/{slug}", response_model=BlogPostDetailResponse, summary="Get Blog Post Detail by Slug"
)
def get_post_by_slug(
    slug: str = Path(..., pattern=r"^[\w\-]+$", min_length=1, max_length=100),
):
    try:
        posts = load_json("blog_posts.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Blog post directory not found")

    post = find_by(posts, slug, "slug")
    if not post:
        raise HTTPException(status_code=404, detail=f"Blog post with slug '{slug}' not found")

    content = ""
    markdown_file = post.get("markdownFile")
    if markdown_file:
        file_path = (POSTS_DIR / markdown_file).resolve()
        # Guard against path traversal: resolved path must remain under POSTS_DIR.
        try:
            file_path.relative_to(POSTS_DIR.resolve())
        except ValueError:
            raise HTTPException(status_code=404, detail=f"Blog post with slug '{slug}' not found")
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

    detail = dict(post)
    detail["content"] = content
    return detail
