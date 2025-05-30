from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models import Admin
from backend.app.core.security import get_password_hash, verify_password
from backend.app.core.config import settings


def create_test_admin(db: Session, username: str = "testadmin", password: str = "testpassword") -> Admin:
    hashed_password = get_password_hash(password)
    admin = Admin(username=username, hashed_password=hashed_password)
    db.add(admin)
    db.commit() # Commit here to make it visible across client request boundaries
    db.refresh(admin)
    return admin


def test_login_success(client: TestClient, db_session: Session):
    # Create a test admin
    test_username = "testuser"
    test_password = "testpassword"
    create_test_admin(db_session, username=test_username, password=test_password)

    # Attempt login
    login_data = {
        "username": test_username,
        "password": test_password,
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_failure_wrong_password(client: TestClient, db_session: Session):
    # Create a test admin
    test_username = "testuserwrongpass"
    test_password = "correctpassword"
    create_test_admin(db_session, username=test_username, password=test_password)

    # Attempt login with wrong password
    login_data = {
        "username": test_username,
        "password": "wrongpassword",
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)

    # Check response
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Incorrect username or password"


def test_login_failure_wrong_username(client: TestClient, db_session: Session):
    # Attempt login with a username that doesn't exist
    login_data = {
        "username": "nonexistentuser",
        "password": "anypassword",
    }
    response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)

    # Check response
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Incorrect username or password"


def test_read_users_me_unauthenticated(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/auth/me")
    assert response.status_code == 401 # Expecting 401 Unauthorized


def test_read_users_me_authenticated(client: TestClient, db_session: Session):
    # Create a test admin and login
    test_username = "authtestuser"
    test_password = "authtestpassword"
    create_test_admin(db_session, username=test_username, password=test_password)
    
    login_data = {"username": test_username, "password": test_password}
    login_response = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    db_session.expire_all() # Force fresh reads from DB for subsequent queries in db_session

    # Access /me endpoint with token
    headers = {"Authorization": f"Bearer {token}"}
    
    # Verify user is still in DB with this session before /me call
    user_in_db_before_me = db_session.query(Admin).filter(Admin.username == test_username).first()
    assert user_in_db_before_me is not None 
    assert user_in_db_before_me.is_active
    
    response = client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)

    # Check response
    # For debugging, print response if it's not 200
    if response.status_code != 200:
        print(f"Failed /me response: {response.json()}")
        
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_username
    assert data["is_active"] is True
    assert "id" in data

# TODO: Add tests for inactive user if that logic is implemented for admins
# TODO: Add tests for token expiration if relevant for /me endpoint (might be hard to test without time manipulation)
