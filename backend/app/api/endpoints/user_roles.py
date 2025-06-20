from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.api import deps
from app.core.roles import RoleType

router = APIRouter()

@router.post("/system", response_model=schemas.user_role.UserRoleRead, status_code=status.HTTP_201_CREATED)
def assign_system_role(
    *,
    db: Session = Depends(deps.get_db),
    role_in: schemas.user_role.UserRoleCreate,
    current_user: models.User = Depends(deps.get_current_active_super_admin) # Only SuperAdmin can assign system roles
) -> models.UserRole:
    if role_in.role_type not in [RoleType.ADMIN, RoleType.SUPER_ADMIN]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only assign ADMIN or SUPER_ADMIN as system roles.")
    if role_in.club_id is not None: # System roles must not have a club_id
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="System roles cannot be club-specific. Omit club_id or ensure it is null.")

    target_user = db.query(models.User).filter(models.User.id == role_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {role_in.user_id} not found.")

    existing_role = db.query(models.UserRole).filter_by(user_id=role_in.user_id, role_type=role_in.role_type, club_id=None).first()
    if existing_role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User already has the system role: {role_in.role_type.value}.")

    db_role = models.UserRole(user_id=role_in.user_id, role_type=role_in.role_type, club_id=None)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.post("/club", response_model=schemas.user_role.UserRoleRead, status_code=status.HTTP_201_CREATED)
def assign_club_manager_role(
    *,
    db: Session = Depends(deps.get_db),
    role_in: schemas.user_role.UserRoleCreate,
    current_user: models.User = Depends(deps.get_current_active_admin) # System Admin or SuperAdmin can assign club managers
) -> models.UserRole:
    if role_in.role_type != RoleType.CLUB_MANAGER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This endpoint is specifically for assigning the CLUB_MANAGER role.")
    if role_in.club_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="club_id is required for CLUB_MANAGER role.")

    target_user = db.query(models.User).filter(models.User.id == role_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {role_in.user_id} not found.")

    target_club = db.query(models.Club).filter(models.Club.id == role_in.club_id).first()
    if not target_club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with id {role_in.club_id} not found.")

    existing_role = db.query(models.UserRole).filter_by(user_id=role_in.user_id, role_type=RoleType.CLUB_MANAGER, club_id=role_in.club_id).first()
    if existing_role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a Club Manager for this club.")

    db_role = models.UserRole(user_id=role_in.user_id, role_type=role_in.role_type, club_id=role_in.club_id)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/user/{user_id}", response_model=List[schemas.user_role.UserRoleRead])
def list_user_roles(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    # Admin can see any user's roles. A user could potentially see their own roles (if another endpoint is made).
    current_user: models.User = Depends(deps.get_current_active_admin)
) -> List[models.UserRole]:
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {user_id} not found.")

    roles = db.query(models.UserRole).filter(models.UserRole.user_id == user_id).all()
    return roles

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    current_user: models.User = Depends(deps.get_current_active_user) # Start with active user, then check specific permissions
) -> None:
    role_to_delete = db.query(models.UserRole).filter(models.UserRole.id == role_id).first()
    if not role_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role assignment not found.")

    # Check permissions
    current_user_is_super_admin = any(r.role_type == RoleType.SUPER_ADMIN for r in current_user.roles)
    current_user_is_admin = any(r.role_type == RoleType.ADMIN for r in current_user.roles)

    can_delete = False

    if current_user_is_super_admin:
        # SuperAdmin can remove any role, but prevent self-removal if it's the last SuperAdmin role
        if role_to_delete.role_type == RoleType.SUPER_ADMIN and role_to_delete.user_id == current_user.id:
            # Count other SuperAdmins
            other_super_admins = db.query(models.UserRole).filter(
                models.UserRole.role_type == RoleType.SUPER_ADMIN,
                models.UserRole.id != role_id # Exclude the role being deleted
            ).count()
            if other_super_admins == 0: # If this is the last one
                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the last Super Admin role from the system.")
        can_delete = True
    elif current_user_is_admin:
        # Admin can remove non-SuperAdmin system roles (i.e., other Admins) and ClubManager roles.
        if role_to_delete.role_type == RoleType.SUPER_ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot remove Super Admin role.")
        if role_to_delete.role_type == RoleType.ADMIN or role_to_delete.role_type == RoleType.CLUB_MANAGER:
            can_delete = True
    # Add other conditions, e.g., club manager removing a club member (general user role for that club)
    # This endpoint is more for system/club_manager roles. General membership is via /clubs/{club_id}/members.

    if not can_delete:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to remove this role assignment.")

    db.delete(role_to_delete)
    db.commit()
    return None
