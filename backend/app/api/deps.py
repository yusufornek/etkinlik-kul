from typing import Optional, Any, List, Generator
from fastapi import Depends, HTTPException, status, Header, Path
from sqlalchemy.orm import Session
from app import models # Assuming models.User, models.UserRole are accessible
from app.core.roles import RoleType
from app.core.database import SessionLocal # Assuming this is your session factory
# Removed: from app.core import security - not used in this new version
# Removed: from app.core.config import settings - not used in this new version
# Removed: from app.models.admin import Admin - MOCK_USERS_DB will serve auth for now
# Removed: from app.schemas.auth import TokenData - not used with mock DB
# Removed: oauth2_scheme and jose imports - not used with mock header auth

MOCK_USERS_DB = {
    "admin@example.com": {"id": 101, "email": "admin@example.com", "is_active": True, "password_hash": "mock_hash", "full_name": "Admin User", "student_id": "S101", "roles_data": [{"role_type": RoleType.ADMIN}]},
    "superadmin@example.com": {"id": 102, "email": "superadmin@example.com", "is_active": True, "password_hash": "mock_hash", "full_name": "Super Admin", "student_id": "S102", "roles_data": [{"role_type": RoleType.SUPER_ADMIN}]},
    "manager_club1@example.com": {"id": 103, "email": "manager_club1@example.com", "is_active": True, "password_hash": "mock_hash", "full_name": "Manager Club 1", "student_id": "S103", "roles_data": [{"role_type": RoleType.CLUB_MANAGER, "club_id": 1}]},
    "user@example.com": {"id": 104, "email": "user@example.com", "is_active": True, "password_hash": "mock_hash", "full_name": "Regular User", "student_id": "S104", "roles_data": [{"role_type": RoleType.USER}]},
    "manager_club2@example.com": {"id": 105, "email": "manager_club2@example.com", "is_active": True, "password_hash": "mock_hash", "full_name": "Manager Club 2", "student_id": "S105", "roles_data": [{"role_type": RoleType.CLUB_MANAGER, "club_id": 2}]},
    "inactive@example.com": {"id": 106, "email": "inactive@example.com", "is_active": False, "password_hash": "mock_hash", "full_name": "Inactive User", "student_id": "S106", "roles_data": [{"role_type": RoleType.USER}]},
}

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(db: Session = Depends(get_db), user_email_header: Optional[str] = Header(None, alias="X-User-Email")) -> Optional[models.User]:
    if user_email_header and user_email_header in MOCK_USERS_DB:
        user_data = MOCK_USERS_DB[user_email_header]

        # Ensure all fields required by User model are present
        user = models.User(
            id=user_data["id"],
            email=user_data["email"],
            is_active=user_data["is_active"],
            password_hash=user_data["password_hash"],
            full_name=user_data.get("full_name"), # Add other fields if User model requires them
            student_id=user_data.get("student_id") # Add other fields
        )

        user.roles = [] # This is an instance variable, not from SQLAlchemy relationship here
        for idx, role_data in enumerate(user_data["roles_data"]):
            mock_role_id = user_data["id"] * 1000 + idx # Ensure unique mock ID
            # Ensure UserRole model can be instantiated with these args
            user.roles.append(models.UserRole(
                id=mock_role_id,
                user_id=user_data["id"],
                role_type=role_data["role_type"],
                club_id=role_data.get("club_id")
            ))
        return user
    return None

async def get_current_active_user(current_user: Optional[models.User] = Depends(get_current_user)) -> models.User:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated (X-User-Email header missing or invalid)")
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    if not hasattr(current_user, 'roles') or not current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")
    if not any(role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN for role in current_user.roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have Admin or Super Admin privileges")
    return current_user

async def get_current_active_super_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    if not hasattr(current_user, 'roles') or not current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")
    if not any(role.role_type == RoleType.SUPER_ADMIN for role in current_user.roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have Super Admin privileges")
    return current_user

def club_manager_dependency_factory(club_id_path_param_name: str = "club_id"):
    async def get_current_club_manager_for_club(
        # club_id_from_path: int = Path(..., description="The ID of the club", alias=club_id_path_param_name), # This will be injected by FastAPI
        current_user: models.User = Depends(get_current_active_user),
        # To get club_id_from_path, it must be a parameter to this inner function,
        # which FastAPI will populate from the path.
        # The alias trick is for when the path parameter in the endpoint function has a different name.
        # If the endpoint function's path parameter is named club_id, then:
        club_id_from_path: int = Path(..., alias=club_id_path_param_name) # Path must be imported from fastapi
    ) -> models.User:
        if not hasattr(current_user, 'roles') or not current_user.roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")

        is_manager_for_club = any(
            role.role_type == RoleType.CLUB_MANAGER and hasattr(role, 'club_id') and role.club_id == club_id_from_path for role in current_user.roles
        )
        is_admin_or_super = any(role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN for role in current_user.roles)

        if not (is_manager_for_club or is_admin_or_super):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"User is not a manager for club {club_id_from_path} nor a system admin.")
        return current_user
    return get_current_club_manager_for_club
