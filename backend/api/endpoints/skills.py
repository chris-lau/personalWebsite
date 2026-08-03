from fastapi import APIRouter, HTTPException

from schemas.skill import SkillCategoryResponse

from ._data import load_json

router = APIRouter()


@router.get("/skills", response_model=list[SkillCategoryResponse], summary="List Skill Categories")
def list_skills():
    try:
        return load_json("skills.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Skills data not found")
