from fastapi import APIRouter, HTTPException

from schemas.now import NowResponse

from ._data import load_json

router = APIRouter()


@router.get("/now", response_model=NowResponse, summary="Get Current Focus (/now)")
def get_now():
    try:
        return load_json("now.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Now data not found")
