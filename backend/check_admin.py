from app.core.database import SessionLocal
from app.models.admin import Admin

def check_admin():
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == 'admin').first()
        if admin:
            print(f"Admin user exists: {admin.username}")
            print(f"Password hash: {admin.hashed_password}")
        else:
            print("Admin user does not exist!")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin()
