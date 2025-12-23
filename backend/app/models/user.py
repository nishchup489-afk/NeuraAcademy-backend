from app.extensions import db
from flask_login import UserMixin
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

class User(UserMixin, db.Model):
    __tablename__ = "users"
    
    id = db.Column(UUID(as_uuid = True), primary_key=True, default=(uuid.uuid4))
    email = db.Column(db.String(100) ,  unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(200), nullable=True)  # nullable for OAuth
    role = db.Column(db.Enum("student", "teacher", "parent", "admin", name="user_roles"), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    email_confirmed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime )
    role_id = db.Column(db.BigInteger )

    # relationships
    student_profile = db.relationship("StudentProfile", uselist=False, back_populates="user")
    teacher_profile = db.relationship("TeacherProfile", uselist=False, back_populates="user")
    parent_profile = db.relationship("ParentProfile", uselist=False, back_populates="user")
