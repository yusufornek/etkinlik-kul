from fastapi import APIRouter

from .endpoints import (
    auth, categories, events, stories, settings,
    clubs, content_requests, user_roles,
    forms, applications # New routers
)

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

# Clubs routes
api_router.include_router(
    clubs.router,
    prefix="/clubs",
    tags=["Clubs"]
)

# Content Requests routes
api_router.include_router(
    content_requests.router,
    prefix="/content-requests",
    tags=["Content Requests"]
)

# User Roles routes
api_router.include_router(
    user_roles.router,
    prefix="/user-roles",
    tags=["User Roles"]
)

# Form Management System routers
api_router.include_router(forms.router, prefix="/forms", tags=["Forms"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
