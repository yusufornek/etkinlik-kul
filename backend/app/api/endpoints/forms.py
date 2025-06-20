from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session, joinedload
from typing import List, Any
from app import models, schemas
from app.api import deps
from app.core.roles import RoleType

router = APIRouter()

# Dependency to get and authorize form access for modification/deletion
async def get_form_for_modification_auth(
    form_id: int = Path(..., description="The ID of the form"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user) # Reuses mock auth from deps.py
) -> models.Form:
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    # Ensure current_user.roles is populated by get_current_active_user from deps.py
    if not hasattr(current_user, 'roles') or not current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")

    is_manager_of_club = any(
        hasattr(role, 'club_id') and role.role_type == RoleType.CLUB_MANAGER and role.club_id == form.club_id
        for role in current_user.roles
    )
    is_system_admin = any(
        role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
        for role in current_user.roles
    )
    if not (is_manager_of_club or is_system_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this form")
    return form

@router.post("/", response_model=schemas.form.FormRead, status_code=status.HTTP_201_CREATED)
def create_form(
    *,
    db: Session = Depends(deps.get_db),
    form_in: schemas.form.FormCreate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> models.Form:
    target_club_id = form_in.club_id
    club = db.query(models.Club).filter(models.Club.id == target_club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with id {target_club_id} not found.")

    if not hasattr(current_user, 'roles') or not current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")

    is_manager_of_club = any(
        hasattr(role, 'club_id') and role.role_type == RoleType.CLUB_MANAGER and role.club_id == target_club_id
        for role in current_user.roles
    )
    is_system_admin = any(
        role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
        for role in current_user.roles
    )
    if not (is_manager_of_club or is_system_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create forms for this club")

    db_form = models.Form(**form_in.model_dump())
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@router.get("/club/{club_id}", response_model=List[schemas.form.FormRead])
def read_forms_by_club(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user) # Added for consistency, can check roles later
) -> List[models.Form]:
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    # Logic to show all forms (active/inactive) to managers/admins vs only active to others
    is_manager_of_club = any(
        hasattr(role, 'club_id') and role.role_type == RoleType.CLUB_MANAGER and role.club_id == club_id
        for role in current_user.roles
    )
    is_system_admin = any(
        role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
        for role in current_user.roles
    )

    query = db.query(models.Form).filter(models.Form.club_id == club_id)
    if not (is_manager_of_club or is_system_admin):
        query = query.filter(models.Form.is_active == True)

    forms = query.order_by(models.Form.created_at.desc()).offset(skip).limit(limit).all()
    return forms

@router.get("/{form_id}", response_model=schemas.form.FormRead)
def read_form(
    *,
    db: Session = Depends(deps.get_db),
    form_id: int,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> models.Form:
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found.")

    if not db_form.is_active:
        is_manager_of_club = any(
            hasattr(role, 'club_id') and role.role_type == RoleType.CLUB_MANAGER and role.club_id == db_form.club_id
            for role in current_user.roles
        )
        is_system_admin = any(
            role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
            for role in current_user.roles
        )
        if not (is_manager_of_club or is_system_admin):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This form is currently not active.")
    return db_form

@router.put("/{form_id}", response_model=schemas.form.FormRead)
def update_form(
    *,
    db: Session = Depends(deps.get_db), # Added db to be explicit, though target_form carries session
    form_in: schemas.form.FormUpdate,
    target_form: models.Form = Depends(get_form_for_modification_auth)
) -> models.Form:
    update_data = form_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(target_form, field, value)
    # db.add(target_form) # Not strictly necessary if target_form is already in session and modified
    db.commit()
    db.refresh(target_form)
    return target_form

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(
    *,
    db: Session = Depends(deps.get_db), # Added db for commit
    target_form: models.Form = Depends(get_form_for_modification_auth)
) -> None:
    db.delete(target_form)
    db.commit()
    return None
