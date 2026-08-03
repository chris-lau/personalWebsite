from fastapi import APIRouter, HTTPException, Path

from schemas.guidebook import GuidebookChapterResponse

from ._data import find_by, load_json

router = APIRouter()


@router.get(
    "/guidebook", response_model=list[GuidebookChapterResponse], summary="List Guidebook Chapters"
)
def list_guidebook_chapters():
    try:
        return load_json("guidebook_chapters.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Guidebook chapters data not found")


@router.get(
    "/guidebook/{chapter_id}",
    response_model=GuidebookChapterResponse,
    summary="Get Guidebook Chapter by ID",
)
def get_guidebook_chapter(
    chapter_id: str = Path(..., pattern=r"^[\w\-]+$", min_length=1, max_length=100),
):
    try:
        chapters = load_json("guidebook_chapters.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Guidebook chapters data not found")
    chapter = find_by(chapters, chapter_id, "id")
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Guidebook chapter '{chapter_id}' not found")
    return chapter
