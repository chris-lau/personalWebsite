from fastapi import APIRouter

from .endpoints import (
    experience,
    github,
    guidebook,
    now,
    posts,
    profile,
    projects,
    skills,
    telemetry,
)

api_router = APIRouter()

api_router.include_router(profile.router, tags=["Profile"])
api_router.include_router(projects.router, tags=["Projects"])
api_router.include_router(skills.router, tags=["Skills"])
api_router.include_router(experience.router, tags=["Experience"])
api_router.include_router(now.router, tags=["Now"])
api_router.include_router(posts.router, tags=["Blog Posts"])
api_router.include_router(guidebook.router, tags=["Guidebook"])
api_router.include_router(github.router, tags=["GitHub Proxy"])
api_router.include_router(telemetry.router, tags=["Telemetry & Health"])

