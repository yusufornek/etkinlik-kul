import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import models first to ensure Base.metadata is populated before Base is used by other modules if any race condition.
from backend.app.models.admin import Admin
from backend.app.models.category import Category
from backend.app.models.event import Event
from backend.app.models.story import Story
from backend.app.core.database import Base, get_db # Base needs to be the one used by models

# Import the module that will be patched, aliased to avoid confusion
import backend.app.core.database as app_db_module_to_patch

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Store original engine and SessionLocal to restore after tests
_original_engine_backup = None
_original_session_local_backup = None

@pytest.fixture(scope="session", autouse=True)
def patch_db_engine_create_tables():
    global _original_engine_backup, _original_session_local_backup

    _original_engine_backup = app_db_module_to_patch.engine
    _original_session_local_backup = app_db_module_to_patch.SessionLocal

    app_db_module_to_patch.engine = test_engine
    app_db_module_to_patch.SessionLocal = TestingSessionLocal
    
    # All models should have been imported, Base.metadata should be complete.
    Base.metadata.create_all(bind=test_engine)
    
    yield # Tests run here
    
    Base.metadata.drop_all(bind=test_engine) # Clean up
    
    # Restore original
    app_db_module_to_patch.engine = _original_engine_backup
    app_db_module_to_patch.SessionLocal = _original_session_local_backup


@pytest.fixture(scope="session")
def test_app(patch_db_engine_create_tables): # Ensures patching is done first
    from backend.app.main import app as actual_app # Import app here, after patching
    return actual_app


@pytest.fixture(scope="function")
def db_session(patch_db_engine_create_tables): # Ensures it runs after patching and table creation
    """
    Yields a SQLAlchemy database session for a single test.
    The session itself will manage its transaction lifecycle.
    Commits must be explicit. Rollback ensures cleanup if no commit.
    """
    # TestingSessionLocal is already bound to test_engine due to patch_db_engine_create_tables
    session = TestingSessionLocal()

    # Clear data from tables before each test to ensure test isolation for committed data
    # Order is important due to foreign key constraints (Event depends on Category)
    # Admin is listed last, assuming no other models depend on it directly for these tests.
    session.query(Event).delete()
    session.query(Category).delete()
    # This will also delete any admin created by startup events (e.g. "testadmin")
    # Tests requiring admin users must create them explicitly.
    session.query(Admin).delete() 
    session.commit() # Commit the deletions

    try:
        yield session
    finally:
        # Rollback any transaction that might be active if the test didn't commit/rollback
        # during the test itself.
        session.rollback() 
        session.close()


@pytest.fixture(scope="function")
def client(db_session, test_app): # Takes the test_app fixture
    """
    Get a TestClient instance that uses the test database.
    """
    # Override the app's get_db dependency to yield the same db_session
    # that the test function is using.
    def override_get_db_shared():
        try:
            yield db_session # Yield the session from the db_session fixture
        finally:
            # The db_session fixture itself is responsible for session cleanup (rollback/close).
            # FastAPI's dependency management would normally call close() if the original
            # get_db had a finally: close(). By having 'pass' here, we prevent
            # premature closing of the session that the test function is still using.
            pass

    test_app.dependency_overrides[get_db] = override_get_db_shared
    
    with TestClient(test_app) as c:
        yield c
    
    test_app.dependency_overrides.clear()
