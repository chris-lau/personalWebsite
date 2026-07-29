import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.experience import ExperienceItemResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get(
    "/experience",
    response_model=list[ExperienceItemResponse],
    summary="List Work & Education Experience",
)
def list_experience():
    exp_path = DATA_DIR / "experience.json"
    if not exp_path.exists():
        raise HTTPException(status_code=404, detail="Experience data not found")
    with open(exp_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
