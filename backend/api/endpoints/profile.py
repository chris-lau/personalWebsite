from fastapi import APIRouter, HTTPException

from schemas.profile import ProfileResponse

from ._data import load_json

router = APIRouter()


@router.get("/profile", response_model=ProfileResponse, summary="Get Developer Profile")
def get_profile():
    try:
        return load_json("profile.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile data not found")
