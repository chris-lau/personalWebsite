import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.guidebook import GuidebookChapterResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get(
    "/guidebook", response_model=list[GuidebookChapterResponse], summary="List Guidebook Chapters"
)
def list_guidebook_chapters():
    guidebook_path = DATA_DIR / "guidebook_chapters.json"
    if not guidebook_path.exists():
        raise HTTPException(status_code=404, detail="Guidebook chapters data not found")
    with open(guidebook_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.get(
    "/guidebook/{chapter_id}",
    response_model=GuidebookChapterResponse,
    summary="Get Guidebook Chapter by ID",
)
def get_guidebook_chapter(chapter_id: str):
    chapters = list_guidebook_chapters()
    chapter = next((c for c in chapters if c["id"] == chapter_id), None)
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Guidebook chapter '{chapter_id}' not found")
    return chapter
