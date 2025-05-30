from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from typing import Dict

from backend.app.core.config import settings
from backend.app.models import Admin, Category, Event
from backend.app.schemas.event import EventCreate, EventUpdate
from backend.app.core.security import get_password_hash

# Helper to create a test admin (can be moved to a shared util later)
def create_test_admin_for_events(db: Session, username: str = "eventadmin", password: str = "eventpass") -> Admin:
    hashed_password = get_password_hash(password)
    admin = Admin(username=username, hashed_password=hashed_password)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

# Helper to get auth headers for the test admin
def get_admin_auth_headers(client: TestClient, db: Session, username: str = "eventadmin", password: str = "eventpass") -> Dict[str, str]:
    create_test_admin_for_events(db, username, password)
    login_data = {"username": username, "password": password}
    r = client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    assert r.status_code == 200, f"Failed to login admin: {r.json()}"
    tokens = r.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}

# Helper to create a test category
def create_test_category(db: Session, name: str = "Test Category", slug: str = "test-category") -> Category:
    category = Category(
        name=name, 
        slug=slug, 
        color_class="bg-blue-500", 
        text_color_class="text-white"
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

# --- Test Cases for POST /events/ ---

def test_create_event_success(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "eventsuccessadmin", "test")
    category = create_test_category(db_session, name="Tech Events", slug="tech-events")
    
    event_data = {
        "title": "Awesome Tech Conference",
        "description": "A conference about awesome new tech.",
        "date": "2024-09-15",
        "time": "09:00",
        "location": "Tech Convention Center",
        "organizer": "Tech Gurus Inc.",
        "category_id": category.id,
        "image_url": "https://example.com/image.jpg",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "address": "123 Tech Street, Los Angeles, CA",
        "requires_registration": True,
        "registration_link": "https://example.com/register",
        "is_active": True,
        "is_featured": False
    }
    
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["title"] == event_data["title"]
    assert data["description"] == event_data["description"]
    assert data["category_id"] == category.id
    assert "id" in data
    
    # Check if it's in the database
    event_in_db = db_session.query(Event).filter(Event.id == data["id"]).first()
    assert event_in_db is not None
    assert event_in_db.title == event_data["title"]

def test_create_event_no_auth(client: TestClient, db_session: Session):
    category = create_test_category(db_session, name="NoAuth Category", slug="noauth-cat")
    event_data = {
        "title": "Event without Auth",
        "description": "Testing no auth.",
        "date": "2024-09-16",
        "time": "10:00",
        "location": "Some Hall",
        "organizer": "Organizer",
        "category_id": category.id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", json=event_data)
    assert response.status_code == 401 # Expecting Unauthorized

def test_create_event_invalid_category(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "eventcatadmin", "test")
    event_data = {
        "title": "Event with Invalid Category",
        "description": "Testing invalid category.",
        "date": "2024-09-17",
        "time": "11:00",
        "location": "Another Hall",
        "organizer": "Org Inc.",
        "category_id": 99999 # Non-existent category ID
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 400 # As per events.py endpoint logic
    assert "Invalid category ID" in response.json()["detail"]

def test_create_event_missing_required_fields(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "eventmissadmin", "test")
    # Missing 'title', 'description', 'date', 'time', 'location', 'organizer', 'category_id'
    
    # Test case 1: Missing title
    event_data_no_title = {
        "description": "No title here.",
        "date": "2024-09-18",
        "time": "12:00",
        "location": "Missing Title Hall",
        "organizer": "No Title Org",
        "category_id": create_test_category(db_session, "cat1", "slug1").id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data_no_title)
    assert response.status_code == 422 # Unprocessable Entity for Pydantic validation
    
    # Test case 2: Missing category_id
    event_data_no_category = {
        "title": "No Category Event",
        "description": "No category here.",
        "date": "2024-09-19",
        "time": "13:00",
        "location": "No Category Hall",
        "organizer": "No Category Org",
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data_no_category)
    assert response.status_code == 422

# TODO: Add tests for other event endpoints (GET all, GET one, PUT, DELETE)
# TODO: Add tests for image_url validation if specific logic exists beyond being a string
# TODO: Add tests for date/time format validation (YYYY-MM-DD, HH:MM) - Pydantic might handle some
# TODO: Refactor admin creation/login to a shared utility if test_auth.py doesn't provide a reusable one.
# For now, `create_test_admin_for_events` and `get_admin_auth_headers` are local to this file.
# The `db_session` fixture from conftest.py (shared session) is used.
# `patch_db_engine_create_tables` ensures tables are created.
# `test_app` fixture provides the app instance.
# `client` fixture provides the TestClient with the overridden (shared) db session.

# Example of an invalid data type test (Pydantic should catch this)
def test_create_event_invalid_data_type(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "eventbaddataadmin", "test")
    category = create_test_category(db_session, name="Bad Data Category", slug="baddata-cat")
    event_data = {
        "title": "Event with Bad Data",
        "description": "Category ID should be int.",
        "date": "2024-09-20",
        "time": "14:00",
        "location": "Error Prone Place",
        "organizer": "Bad Data Inc.",
        "category_id": "not-an-integer" # Invalid data type
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 422 # Unprocessable Entity

# Test creating an event with minimal required fields
def test_create_event_minimal_fields(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "eventminimaladmin", "test")
    category = create_test_category(db_session, name="Minimal Category", slug="minimal-cat")
    
    event_data = {
        "title": "Minimal Event",
        "description": "Just the essentials.",
        "date": "2024-09-21",
        "time": "15:00",
        "location": "Minimalist Hall",
        "organizer": "Bare Bones Org",
        "category_id": category.id
        # image_url, latitude, longitude, etc., are optional
    }
    
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["title"] == event_data["title"]
    assert data["is_active"] is True # Default value
    assert data["is_featured"] is False # Default value
    
    event_in_db = db_session.query(Event).filter(Event.id == data["id"]).first()
    assert event_in_db is not None
    assert event_in_db.title == event_data["title"]

# --- End of Test Cases for POST /events/ ---

# --- Test Cases for GET /events/ (List Events) ---

def test_list_events_empty(client: TestClient, db_session: Session):
    response = client.get(f"{settings.API_V1_STR}/events/")
    assert response.status_code == 200
    assert response.json() == []

def test_list_events_with_data(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "listeventsadmin", "test")
    category = create_test_category(db_session, name="List Category", slug="list-cat")
    
    event_data1 = {
        "title": "Event 1 for Listing", "description": "Desc 1", "date": "2024-10-01", "time": "10:00",
        "location": "Location 1", "organizer": "Org 1", "category_id": category.id
    }
    client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data1)
    
    event_data2 = {
        "title": "Event 2 for Listing", "description": "Desc 2", "date": "2024-10-02", "time": "11:00",
        "location": "Location 2", "organizer": "Org 2", "category_id": category.id
    }
    client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data2)
    
    response = client.get(f"{settings.API_V1_STR}/events/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == event_data1["title"]
    assert data[1]["title"] == event_data2["title"]

def test_list_events_filter_by_category(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "listcatfilteradmin", "test")
    cat1 = create_test_category(db_session, name="Category A", slug="cat-a")
    cat2 = create_test_category(db_session, name="Category B", slug="cat-b")

    client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json={
        "title": "Event Cat A", "description": "A", "date": "2024-11-01", "time": "10:00",
        "location": "Loc A", "organizer": "Org A", "category_id": cat1.id
    })
    client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json={
        "title": "Event Cat B", "description": "B", "date": "2024-11-02", "time": "11:00",
        "location": "Loc B", "organizer": "Org B", "category_id": cat2.id
    })

    response = client.get(f"{settings.API_V1_STR}/events/?category_id={cat1.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Event Cat A"

def test_list_events_search(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "listsearchadmin", "test")
    category = create_test_category(db_session, name="Search Category", slug="search-cat")
    
    client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json={
        "title": "Unique Searchable Event Alpha", "description": "Desc Alpha", "date": "2024-12-01", "time": "10:00",
        "location": "AlphaLoc", "organizer": "AlphaOrg", "category_id": category.id
    })
    client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json={
        "title": "Another Event Beta", "description": "Desc Beta Searchable", "date": "2024-12-02", "time": "11:00",
        "location": "BetaLoc", "organizer": "BetaOrg", "category_id": category.id
    })

    response = client.get(f"{settings.API_V1_STR}/events/?search=Unique Searchable")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Unique Searchable Event Alpha"

    response_desc = client.get(f"{settings.API_V1_STR}/events/?search=Beta Searchable")
    assert response_desc.status_code == 200
    data_desc = response_desc.json()
    assert len(data_desc) == 1
    assert data_desc[0]["title"] == "Another Event Beta"

# --- Test Cases for GET /events/{event_id} (Get Single Event) ---

def test_get_single_event_success(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "geteventadmin", "test")
    category = create_test_category(db_session, name="Get Category", slug="get-cat")
    event_data = {
        "title": "Specific Event to Get", "description": "Details here", "date": "2024-10-03", "time": "12:00",
        "location": "Specific Location", "organizer": "Specific Org", "category_id": category.id
    }
    create_response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert create_response.status_code == 200
    event_id = create_response.json()["id"]
    
    response = client.get(f"{settings.API_V1_STR}/events/{event_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == event_id
    assert data["title"] == event_data["title"]
    assert data["category"]["id"] == category.id # Check nested category details

def test_get_single_event_not_found(client: TestClient, db_session: Session):
    response = client.get(f"{settings.API_V1_STR}/events/99999") # Non-existent ID
    assert response.status_code == 404
    assert "Event not found" in response.json()["detail"]


# --- Test Cases for PUT /events/{event_id} ---

def test_update_event_success(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "updateeventadmin", "test")
    category1 = create_test_category(db_session, name="Initial Category", slug="initial-cat")
    category2 = create_test_category(db_session, name="Updated Category", slug="updated-cat")

    # Create an event first
    event_data = {
        "title": "Event to Update", "description": "Original Description", "date": "2024-11-10", 
        "time": "10:00", "location": "Old Location", "organizer": "Old Org", "category_id": category1.id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 200
    created_event_id = response.json()["id"]

    # Data for updating the event
    update_payload = {
        "title": "Updated Event Title",
        "description": "Updated Description",
        "location": "New Location",
        "category_id": category2.id,
        "is_featured": True
    }
    
    response = client.put(f"{settings.API_V1_STR}/events/{created_event_id}", headers=admin_headers, json=update_payload)
    assert response.status_code == 200, response.json()
    
    updated_event_data = response.json()
    assert updated_event_data["title"] == update_payload["title"]
    assert updated_event_data["description"] == update_payload["description"]
    assert updated_event_data["location"] == update_payload["location"]
    assert updated_event_data["category"]["id"] == category2.id
    assert updated_event_data["is_featured"] is True
    
    # Verify in DB
    db_event = db_session.query(Event).filter(Event.id == created_event_id).first()
    assert db_event.title == update_payload["title"]
    assert db_event.category_id == category2.id
    assert db_event.is_featured is True

def test_update_event_not_found(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "updateeventnotfound", "test")
    update_payload = {"title": "Trying to Update NonExistent"}
    response = client.put(f"{settings.API_V1_STR}/events/87654", headers=admin_headers, json=update_payload)
    assert response.status_code == 404
    assert "Event not found" in response.json()["detail"]

def test_update_event_invalid_category_id(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "updateeventbadcat", "test")
    category1 = create_test_category(db_session, name="Category For Update Test", slug="cat-update")
    event_data = {
        "title": "Event For Bad Cat Update", "description": "Desc", "date": "2024-11-11", 
        "time": "11:00", "location": "Some Location", "organizer": "Some Org", "category_id": category1.id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 200
    created_event_id = response.json()["id"]

    update_payload = {"category_id": 87655} # Non-existent category
    response = client.put(f"{settings.API_V1_STR}/events/{created_event_id}", headers=admin_headers, json=update_payload)
    assert response.status_code == 400
    assert "Invalid category ID" in response.json()["detail"]

def test_update_event_no_auth(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "updateeventcreateadmin", "test") # To create event
    category = create_test_category(db_session, name="Update NoAuth Category", slug="update-noauth-cat")
    event_data = {
        "title": "Event For NoAuth Update", "description": "Desc", "date": "2024-11-12", 
        "time": "12:00", "location": "Location", "organizer": "Org", "category_id": category.id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 200
    created_event_id = response.json()["id"]

    update_payload = {"title": "Update Attempt Without Auth"}
    response = client.put(f"{settings.API_V1_STR}/events/{created_event_id}", json=update_payload) # No headers
    assert response.status_code == 401

# --- Test Cases for DELETE /events/{event_id} ---

def test_delete_event_success(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "deleteeventadmin", "test")
    category = create_test_category(db_session, name="Delete Category", slug="delete-cat")
    event_data = {
        "title": "Event to Delete", "description": "Will be deleted", "date": "2024-11-13", 
        "time": "13:00", "location": "Deletion Location", "organizer": "Deletion Org", "category_id": category.id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 200
    created_event_id = response.json()["id"]

    # Verify it's in DB before delete
    assert db_session.query(Event).filter(Event.id == created_event_id).first() is not None
    
    delete_response = client.delete(f"{settings.API_V1_STR}/events/{created_event_id}", headers=admin_headers)
    assert delete_response.status_code == 200
    assert "Event deleted successfully" in delete_response.json()["message"]
    
    # Verify it's gone from DB
    assert db_session.query(Event).filter(Event.id == created_event_id).first() is None

def test_delete_event_not_found(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "deleteeventnotfound", "test")
    response = client.delete(f"{settings.API_V1_STR}/events/87656", headers=admin_headers)
    assert response.status_code == 404
    assert "Event not found" in response.json()["detail"]

def test_delete_event_no_auth(client: TestClient, db_session: Session):
    admin_headers = get_admin_auth_headers(client, db_session, "deleteeventcreateadmin", "test") # To create event
    category = create_test_category(db_session, name="Delete NoAuth Category", slug="delete-noauth-cat")
    event_data = {
        "title": "Event For NoAuth Delete", "description": "Desc", "date": "2024-11-14", 
        "time": "14:00", "location": "Location", "organizer": "Org", "category_id": category.id
    }
    response = client.post(f"{settings.API_V1_STR}/events/", headers=admin_headers, json=event_data)
    assert response.status_code == 200
    created_event_id = response.json()["id"]

    response = client.delete(f"{settings.API_V1_STR}/events/{created_event_id}") # No headers
    assert response.status_code == 401


# --- Placeholder for Image Upload ---
def test_upload_event_image(): # Will require different setup for file uploads
    pass
