from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session, joinedload # Ensure joinedload is imported
from typing import List
from datetime import datetime
from app import models, schemas
from app.api import deps
from app.core.roles import RoleType

router = APIRouter()

@router.post("/", response_model=schemas.content_request.ContentRequestRead, status_code=status.HTTP_201_CREATED)
def create_content_request(
    *,
    db: Session = Depends(deps.get_db),
    request_in: schemas.content_request.ContentRequestCreate,
    current_user: models.User = Depends(deps.get_current_active_user) # User must be active
) -> models.ContentRequest:
    if not hasattr(current_user, 'roles') or not current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")

    # Authorization: User must be a manager of the club_id in request_in OR an Admin/SuperAdmin
    is_authorized_club_manager = any(
        role.role_type == RoleType.CLUB_MANAGER and hasattr(role, 'club_id') and role.club_id == request_in.club_id
        for role in current_user.roles
    )
    is_admin_or_super = any(
        role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
        for role in current_user.roles
    )

    if not (is_authorized_club_manager or is_admin_or_super):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"User not authorized to create content requests for club {request_in.club_id}")

    # model_dump(exclude_unset=True) is good practice if not all fields are always provided
    db_request = models.ContentRequest(**request_in.model_dump(), submitted_at=datetime.utcnow())
    # reviewer_id is not set on creation
    db_request.reviewer_id = None
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/pending", response_model=List[schemas.content_request.ContentRequestRead])
def list_pending_content_requests(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_admin) # Only Admin/SuperAdmin can see all pending
) -> List[models.ContentRequest]:
    requests = (
        db.query(models.ContentRequest)
        .options(joinedload(models.ContentRequest.club)) # Eager load club data
        .filter(models.ContentRequest.status == "pending")
        .order_by(models.ContentRequest.submitted_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return requests

@router.put("/{request_id}/approve", response_model=schemas.content_request.ContentRequestRead)
def approve_content_request(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    current_user: models.User = Depends(deps.get_current_active_admin) # Only Admin/SuperAdmin can approve
) -> models.ContentRequest:
    db_request = db.query(models.ContentRequest).filter(models.ContentRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content request not found")
    if db_request.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Content request is already in status '{db_request.status}'")

    db_request.status = "approved"
    db_request.reviewed_at = datetime.utcnow()
    db_request.reviewer_id = current_user.id
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.put("/{request_id}/reject", response_model=schemas.content_request.ContentRequestRead)
def reject_content_request(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    current_user: models.User = Depends(deps.get_current_active_admin) # Only Admin/SuperAdmin can reject
) -> models.ContentRequest:
    db_request = db.query(models.ContentRequest).filter(models.ContentRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content request not found")
    if db_request.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Content request is already in status '{db_request.status}'")

    db_request.status = "rejected"
    db_request.reviewed_at = datetime.utcnow()
    db_request.reviewer_id = current_user.id
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/club/{club_id}", response_model=List[schemas.content_request.ContentRequestRead])
def list_club_content_requests(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int = Path(..., description="The ID of the club"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.club_manager_dependency_factory(club_id_path_param_name="club_id")) # Club manager or Admin/SuperAdmin
) -> List[models.ContentRequest]:
    # Verify club exists
    target_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not target_club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with id {club_id} not found.")

    requests = db.query(models.ContentRequest).filter(models.ContentRequest.club_id == club_id).order_by(models.ContentRequest.submitted_at.desc()).offset(skip).limit(limit).all()
    return requests
