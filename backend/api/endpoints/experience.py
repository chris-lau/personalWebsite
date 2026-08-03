from fastapi import APIRouter, HTTPException

from schemas.experience import ExperienceItemResponse

from ._data import load_json

router = APIRouter()


@router.get(
    "/experience",
    response_model=list[ExperienceItemResponse],
    summary="List Work & Education Experience",
)
def list_experience():
    try:
        return load_json("experience.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Experience data not found")
