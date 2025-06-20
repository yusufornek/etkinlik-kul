from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime # Keep for updated_at, though model might handle it
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.club.ClubRead, status_code=status.HTTP_201_CREATED)
def create_club(
    *,
    db: Session = Depends(deps.get_db),
    club_in: schemas.club.ClubCreate,
    current_user: models.User = Depends(deps.get_current_active_admin) # Requires Admin or SuperAdmin
) -> models.Club:
    db_club = models.Club(**club_in.model_dump())
    # db_club.created_at = datetime.utcnow() # Model default should handle this
    # db_club.updated_at = datetime.utcnow() # Model default/onupdate should handle this
    db.add(db_club)
    db.commit()
    db.refresh(db_club)
    return db_club

@router.get("/", response_model=List[schemas.club.ClubRead])
def read_clubs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user) # Any active user can list clubs
) -> List[models.Club]:
    clubs = db.query(models.Club).filter(models.Club.is_active == True).offset(skip).limit(limit).all()
    return clubs

@router.get("/{club_id}", response_model=schemas.club.ClubRead)
def read_club(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int,
    current_user: models.User = Depends(deps.get_current_active_user) # Any active user can read a specific club
) -> models.Club:
    db_club = db.query(models.Club).filter(models.Club.id == club_id, models.Club.is_active == True).first()
    if not db_club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found or not active")
    return db_club

@router.put("/{club_id}", response_model=schemas.club.ClubRead)
def update_club(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int = Path(..., description="The ID of the club to update"),
    club_in: schemas.club.ClubUpdate,
    current_user: models.User = Depends(deps.club_manager_dependency_factory(club_id_path_param_name="club_id"))
) -> models.Club:
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    update_data = club_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_club, field, value)

    # The model definition for updated_at uses onupdate=func.now(), so this line might be redundant
    # if the ORM handles it automatically on flush. Explicitly setting it ensures it.
    # db_club.updated_at = datetime.utcnow() # For databases/setups where onupdate is not server-side

    db.add(db_club) # or db.merge(db_club) if session state is complex
    db.commit()
    db.refresh(db_club)
    return db_club

@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int,
    current_user: models.User = Depends(deps.get_current_active_admin) # Requires Admin or SuperAdmin
) -> None:
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    # Consider soft delete vs hard delete based on application requirements.
    # Current: hard delete.
    db.delete(db_club)
    db.commit()
    return None

# Club Member Management Endpoints

@router.post("/{club_id}/members", response_model=schemas.club.ClubMemberRead, status_code=status.HTTP_201_CREATED)
def add_club_member(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int = Path(..., description="The ID of the club to add a member to"),
    member_in: schemas.club.ClubMemberCreate,
    current_user: models.User = Depends(deps.club_manager_dependency_factory(club_id_path_param_name="club_id"))
) -> models.ClubMember:
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with id {club_id} not found.")

    user_to_add = db.query(models.User).filter(models.User.id == member_in.user_id).first()
    if not user_to_add:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {member_in.user_id} not found.")

    existing_membership = db.query(models.ClubMember).filter_by(club_id=club_id, user_id=member_in.user_id).first()
    if existing_membership:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member of this club.")

    # Ensure ClubMember model has club_id, user_id, role fields. `joined_at` should have a default.
    db_member = models.ClubMember(club_id=club_id, user_id=member_in.user_id, role=member_in.role)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    # For the response, load the user relationship if schema expects it
    db.refresh(db_member, attribute_names=['user']) # Eagerly load user if needed for schema
    return db_member

@router.get("/{club_id}/members", response_model=List[schemas.club.ClubMemberRead])
def list_club_members(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int,
    current_user: models.User = Depends(deps.get_current_active_user) # Any active user can list members
) -> List[models.ClubMember]:
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with id {club_id} not found.")

    # Eagerly load the 'user' relationship of each 'ClubMember'
    # This is important if schemas.club.ClubMemberRead includes user details.
    members = db.query(models.ClubMember).filter(models.ClubMember.club_id == club_id).options(joinedload(models.ClubMember.user)).all()
    return members

@router.delete("/{club_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_club_member(
    *,
    db: Session = Depends(deps.get_db),
    club_id: int = Path(..., description="The ID of the club"),
    user_id: int = Path(..., description="The ID of the user to remove"),
    current_user: models.User = Depends(deps.club_manager_dependency_factory(club_id_path_param_name="club_id"))
) -> None:
    membership = db.query(models.ClubMember).filter_by(club_id=club_id, user_id=user_id).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found.")

    # Add logic here if users should not be able to remove themselves, or if only specific roles can be removed by managers.
    # For example, a club manager might not be able to remove another club manager or the club president.
    # Such logic depends on specific business rules.

    db.delete(membership)
    db.commit()
    return None
