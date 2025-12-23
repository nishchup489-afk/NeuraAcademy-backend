from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class TeacherProfile(db.Model):
    __tablename__ = "teacher_profiles"

    id = db.Column(UUID(as_uuid = True), primary_key=True, default=(uuid.uuid4))
    user_id = db.Column(UUID(as_uuid = True), db.ForeignKey("users.id"), default = uuid.uuid4 ,unique=True)
    teacher_code = db.Column(db.String(20), unique=True)

    platform_name = db.Column(db.String(120))
    education_info = db.Column(db.Text)
    years_experience = db.Column(db.Integer)

    verified = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=db.func.now())

    # relationship
    user = db.relationship("User", back_populates="teacher_profile")
