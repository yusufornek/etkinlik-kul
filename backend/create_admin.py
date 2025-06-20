import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.admin import Admin
from app.core.security import get_password_hash

print("Creating database tables...")
Base.metadata.create_all(bind=engine)

print("Creating admin user...")
db = SessionLocal()

try:
    # Check if admin already exists
    existing_admin = db.query(Admin).filter(Admin.username == "admin").first()
    if existing_admin:
        print("Admin user already exists")
        print(f"Username: {existing_admin.username}")
    else:
        # Create new admin
        hashed_password = get_password_hash("admin123")
        admin = Admin(
            username="admin",
            hashed_password=hashed_password
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully!")
        print("Username: admin")
        print("Password: admin123")
        
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()

print("Done!")
