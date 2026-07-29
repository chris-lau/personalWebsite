import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.skill import SkillCategoryResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get("/skills", response_model=list[SkillCategoryResponse], summary="List Skill Categories")
def list_skills():
    skills_path = DATA_DIR / "skills.json"
    if not skills_path.exists():
        raise HTTPException(status_code=404, detail="Skills data not found")
    with open(skills_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
