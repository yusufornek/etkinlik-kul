from fastapi import APIRouter

from .endpoints import auth, categories, events, stories, settings

api_router = APIRouter()

# Auth routes
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

# Categories routes
api_router.include_router(
    categories.router,
    prefix="/categories",
    tags=["categories"]
)

# Events routes
api_router.include_router(
    events.router,
    prefix="/events",
    tags=["events"]
)

# Stories routes
api_router.include_router(
    stories.router,
    prefix="/stories",
    tags=["stories"]
)

# Settings routes
api_router.include_router(
    settings.router,
    prefix="/settings",
    tags=["settings"]
)
