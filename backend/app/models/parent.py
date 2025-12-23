from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class ParentProfile(db.Model):
    __tablename__ = "parent_profiles"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"), unique=True, nullable=False)
    parent_code = db.Column(db.String(20), unique=True, nullable=False)
    joined_at = db.Column(db.DateTime, default=db.func.now())
    is_active = db.Column(db.Boolean, default=True)

    # relationship
    user = db.relationship("User", back_populates="parent_profile")
    student_links = db.relationship("ParentStudentLink", back_populates="parent")


class ParentStudentLink(db.Model):
    __tablename__ = "parent_student_links"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = db.Column(UUID(as_uuid=True), db.ForeignKey("parent_profiles.id"), nullable=False)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id"), nullable=False)
    status = db.Column(db.Enum("pending", "approved", "rejected", name="link_status"), default="pending", nullable=False)
    requested_at = db.Column(db.DateTime, default=db.func.now())
    approved_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    parent = db.relationship("ParentProfile", back_populates="student_links")
    student = db.relationship("StudentProfile", back_populates="parent_links")

    __table_args__ = (db.UniqueConstraint('parent_id', 'student_id', name='unique_parent_student'),)
