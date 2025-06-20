from fastapi import APIRouter, Depends, HTTPException, status, Path, File, UploadFile, Form as FastAPIForm
from sqlalchemy.orm import Session, joinedload
from typing import List, Any, Optional
import shutil
import os
import json
from app import models, schemas
from app.api import deps
from app.core.roles import RoleType
from app.core.config import settings

router = APIRouter()

# Dependency to get and authorize application access
async def get_application_for_auth(
    application_id: int = Path(..., description="The ID of the application"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user) # Reuses mock auth
) -> models.Application:
    application = (
        db.query(models.Application)
        .options(joinedload(models.Application.form)) # Eager load form for club_id access
        .filter(models.Application.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if not hasattr(current_user, 'roles') or not current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no roles assigned")

    # Authorization: Submitter, or manager of the club owning the form, or system admin
    if application.user_id == current_user.id:
        return application # Submitter can access

    # Need application.form to be loaded to check application.form.club_id
    if not application.form:
         # This should not happen if DB constraints are set up and form is always loaded.
         # Or if form was deleted after application was made (cascade might delete app too)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Application is not linked to a form.")


    is_manager_of_club = any(
        hasattr(role, 'club_id') and role.role_type == RoleType.CLUB_MANAGER and role.club_id == application.form.club_id
        for role in current_user.roles
    )
    is_system_admin = any(
        role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
        for role in current_user.roles
    )
    if not (is_manager_of_club or is_system_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this application")

    return application

@router.post("/form/{form_id}", response_model=schemas.form.ApplicationRead, status_code=status.HTTP_201_CREATED)
async def submit_application(
    *,
    db: Session = Depends(deps.get_db),
    form_id: int = Path(..., description="The ID of the form to submit to"),
    data_json_str: str = FastAPIForm(..., alias="data_json"),
    files: Optional[List[UploadFile]] = File(None, description="Optional files for the application"),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> models.Application:
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.is_active == True).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active form not found or form does not exist")

    try:
        application_data_dict = json.loads(data_json_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON format for data_json.")

    # TODO: Add validation of application_data_dict against form.fields_json definition here
    # This is a crucial step for real-world applications.

    db_application = models.Application(
        data_json=application_data_dict,
        form_id=form_id,
        user_id=current_user.id,
        status="submitted"
    )
    db.add(db_application)
    # Must commit here to get db_application.id for file path
    try:
        db.commit()
        db.refresh(db_application)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create application entry: {str(e)}")


    if files:
        upload_dir_base = settings.UPLOAD_DIR
        if not upload_dir_base or not os.path.exists(upload_dir_base):
            os.makedirs(upload_dir_base, exist_ok=True)

        application_specific_upload_dir = os.path.join(upload_dir_base, "applications", str(db_application.id))
        if not os.path.exists(application_specific_upload_dir):
            os.makedirs(application_specific_upload_dir, exist_ok=True)

        saved_file_paths = []
        for file_obj in files:
            if not file_obj.filename: continue
            safe_filename = os.path.basename(file_obj.filename) # Basic sanitization
            file_location = os.path.join(application_specific_upload_dir, safe_filename)

            try:
                with open(file_location, "wb+") as file_buffer:
                    shutil.copyfileobj(file_obj.file, file_buffer)
                saved_file_paths.append(file_location) # Keep track of successfully saved files
            except Exception as e:
                # Cleanup already saved files for this application if one fails? Or log and continue?
                # For now, just raise an error.
                db.delete(db_application) # Rollback application if file upload fails
                db.commit()
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not save file {safe_filename}: {str(e)}")
            finally:
                await file_obj.close()

            db_app_file = models.ApplicationFile(
                application_id=db_application.id,
                file_path=file_location,
                original_file_name=safe_filename,
                file_type=file_obj.content_type
            )
            db.add(db_app_file)

        try:
            db.commit()
            db.refresh(db_application, attribute_names=['application_files'])
        except Exception as e:
            db.rollback()
            # Attempt to delete files that were physically saved if DB operation fails
            for fp in saved_file_paths:
                if os.path.exists(fp): os.remove(fp)
            # Also delete the application itself as it's now in an inconsistent state
            db.delete(db_application)
            db.commit()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save file metadata to DB: {str(e)}")


    db.refresh(db_application, attribute_names=['submitter'])
    return db_application

@router.get("/form/{form_id}/applications", response_model=List[schemas.form.ApplicationRead])
def list_applications_for_form(
    *,
    db: Session = Depends(deps.get_db),
    form_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> List[models.Application]:
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

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
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view applications for this form")

    applications = (
        db.query(models.Application)
        .filter(models.Application.form_id == form_id)
        .options(joinedload(models.Application.submitter), joinedload(models.Application.application_files))
        .order_by(models.Application.submitted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return applications

@router.get("/{application_id}", response_model=schemas.form.ApplicationRead)
def read_application(
    target_application: models.Application = Depends(get_application_for_auth),
    db: Session = Depends(deps.get_db)
) -> models.Application:
    # Ensure relationships needed by ApplicationRead are loaded.
    # get_application_for_auth loads 'form'. 'submitter' and 'application_files' might also be needed.
    db.refresh(target_application, attribute_names=['submitter', 'application_files'])
    return target_application

@router.put("/{application_id}/status", response_model=schemas.form.ApplicationRead)
def update_application_status(
    *,
    db: Session = Depends(deps.get_db),
    status_in: schemas.form.ApplicationUpdateStatus,
    target_application: models.Application = Depends(get_application_for_auth), # Auth check
    current_user: models.User = Depends(deps.get_current_active_user) # Get current user for explicit check
) -> models.Application:
    # get_application_for_auth allows submitter to view. We must prevent submitter from changing status.
    if target_application.user_id == current_user.id:
        # Check if they also have a managing role for this form's club (edge case)
        is_manager_of_club_for_form = any(
            hasattr(role, 'club_id') and role.role_type == RoleType.CLUB_MANAGER and role.club_id == target_application.form.club_id
            for role in current_user.roles
        )
        is_system_admin = any(
            role.role_type == RoleType.ADMIN or role.role_type == RoleType.SUPER_ADMIN
            for role in current_user.roles
        )
        if not (is_manager_of_club_for_form or is_system_admin):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Submitters cannot change application status.")

    target_application.status = status_in.status
    db.add(target_application)
    db.commit()
    db.refresh(target_application)
    # Ensure relationships are loaded for the response model
    db.refresh(target_application, attribute_names=['submitter', 'application_files', 'form'])
    return target_application
