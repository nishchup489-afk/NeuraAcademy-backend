from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=(uuid.uuid4))
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey("teacher_profiles.id") , default=uuid.uuid4)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    price = db.Column(db.Numeric)
    status = db.Column(db.Enum("draft","published","archived", name="course_status"), default="draft")
    created_at = db.Column(db.DateTime, default=db.func.now())

    teacher = db.relationship("TeacherProfile", backref=db.backref("courses", lazy=True))


class CourseEnrollment(db.Model):
    __tablename__ = "course_enrollments"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=(uuid.uuid4))
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id") , default=(uuid.uuid4))
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey("courses.id") , default=(uuid.uuid4) )
    enrolled_at = db.Column(db.DateTime, default=db.func.now())
    progress_percent = db.Column(db.Float, default=0.0)
    completed = db.Column(db.Boolean, default=False)
