import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.now import NowResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get("/now", response_model=NowResponse, summary="Get Current Focus (/now)")
def get_now():
    now_path = DATA_DIR / "now.json"
    if not now_path.exists():
        raise HTTPException(status_code=404, detail="Now data not found")
    with open(now_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
