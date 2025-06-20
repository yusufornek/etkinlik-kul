from enum import Enum

class RoleType(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CLUB_MANAGER = "club_manager"
    USER = "user" # General user
