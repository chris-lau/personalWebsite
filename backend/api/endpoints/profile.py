import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.profile import ProfileResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get("/profile", response_model=ProfileResponse, summary="Get Developer Profile")
def get_profile():
    profile_path = DATA_DIR / "profile.json"
    if not profile_path.exists():
        raise HTTPException(status_code=404, detail="Profile data not found")
    with open(profile_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
