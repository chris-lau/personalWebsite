import sys

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.db import get_db
from core.models import NowEntry
from schemas.now import NowResponse

from ._data import load_json

router = APIRouter()


def map_now_to_response(db_entries: list[NowEntry]) -> NowResponse:
    """Helper to transform list of NowEntry DB models into NowResponse schema."""
    last_updated = "Unknown"
    current_focus = ""
    working_on = []
    reading = []
    learning = []

    for entry in db_entries:
        if entry.category == "lastUpdated":
            last_updated = entry.content
        elif entry.category == "currentFocus":
            current_focus = entry.content
        elif entry.category == "workingOn":
            working_on.append(entry.content)
        elif entry.category == "reading":
            reading.append(entry.content)
        elif entry.category == "learning":
            learning.append(entry.content)

    return NowResponse(
        lastUpdated=last_updated,
        currentFocus=current_focus,
        workingOn=working_on,
        reading=reading,
        learning=learning,
    )


@router.get("/now", response_model=NowResponse, summary="Get Current Focus (/now)")
def get_now(db: Session = Depends(get_db)):
    try:
        db_entries = db.query(NowEntry).all()
        # If database is successfully queried but has no entries, we fall back to JSON
        if db_entries:
            return map_now_to_response(db_entries)
    except Exception as e:
        sys.stderr.write(f"[WARN] Database connection failed, falling back to JSON: {e}\n")

    # Fallback to local JSON file
    try:
        return load_json("now.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Now data not found")
