from fastapi import APIRouter, HTTPException, Path

from schemas.project import ProjectResponse

from ._data import find_by, load_json

router = APIRouter()


@router.get("/projects", response_model=list[ProjectResponse], summary="List Portfolio Projects")
def list_projects():
    try:
        return load_json("projects.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Projects data not found")


@router.get("/projects/{slug}", response_model=ProjectResponse, summary="Get Project by ID/Slug")
def get_project_by_slug(
    slug: str = Path(..., pattern=r"^[\w\-]+$", min_length=1, max_length=100),
):
    try:
        projects = load_json("projects.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Projects data not found")
    project = find_by(projects, slug, "id")
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID '{slug}' not found")
    return project
