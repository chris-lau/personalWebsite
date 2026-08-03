import sys

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from core.db import get_db
from core.models import Project
from schemas.project import ProjectResponse

from ._data import find_by, load_json

router = APIRouter()


def map_project_to_response(project: Project) -> ProjectResponse:
    """Helper to transform Project DB model into ProjectResponse schema."""
    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        techStack=[t.name for t in project.technologies],
        githubUrl=project.github_url,
        liveUrl=project.live_url,
        featured=project.featured,
    )


@router.get("/projects", response_model=list[ProjectResponse], summary="List Portfolio Projects")
def list_projects(db: Session = Depends(get_db)):
    try:
        # Query from database
        db_projects = db.query(Project).all()
        if db_projects:
            return [map_project_to_response(p) for p in db_projects]
    except Exception as e:
        # Fallback to local JSON file if database fails or is unreachable
        sys.stderr.write(f"[WARN] Database connection failed, falling back to JSON: {e}\n")

    try:
        return load_json("projects.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Projects data not found")


@router.get("/projects/{slug}", response_model=ProjectResponse, summary="Get Project by ID/Slug")
def get_project_by_slug(
    slug: str = Path(..., pattern=r"^[\w\-]+$", min_length=1, max_length=100),
    db: Session = Depends(get_db),
):
    try:
        # Query from database
        project = db.query(Project).filter_by(id=slug).first()
        if project:
            return map_project_to_response(project)
    except Exception as e:
        sys.stderr.write(f"[WARN] Database connection failed, falling back to JSON: {e}\n")

    # Fallback to local JSON file
    try:
        projects = load_json("projects.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Projects data not found")
    project_json = find_by(projects, slug, "id")
    if not project_json:
        raise HTTPException(status_code=404, detail=f"Project with ID '{slug}' not found")
    return project_json
