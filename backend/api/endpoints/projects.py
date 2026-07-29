import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from schemas.project import ProjectResponse

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


@router.get("/projects", response_model=list[ProjectResponse], summary="List Portfolio Projects")
def list_projects():
    projects_path = DATA_DIR / "projects.json"
    if not projects_path.exists():
        raise HTTPException(status_code=404, detail="Projects data not found")
    with open(projects_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.get("/projects/{slug}", response_model=ProjectResponse, summary="Get Project by ID/Slug")
def get_project_by_slug(slug: str):
    projects = list_projects()
    project = next((p for p in projects if p["id"] == slug), None)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID '{slug}' not found")
    return project
