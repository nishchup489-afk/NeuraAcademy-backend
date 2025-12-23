from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=(uuid.uuid4))
    user_id = db.Column(UUID(as_uuid=True) , db.ForeignKey("users.id"), default = uuid.uuid4)
    student_code = db.Column(db.String(20), unique=True)


    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))


    date_of_birth = db.Column(db.Date )


    country_code = db.Column(db.String(6))
    country = db.Column(db.String(20))


    phone = db.Column(db.String(20), nullable=True)  # instead of db.Integer

    avatar_url = db.Column(db.Text)
    bio = db.Column(db.Text)

    github = db.Column(db.String(300))
    facebook = db.Column(db.String(300))
    x = db.Column(db.String(300))
    linkedin = db.Column(db.String(300))
    instagram = db.Column(db.String(300))
    joined_at = db.Column(db.DateTime, default=db.func.now())

    # relationship
    user = db.relationship("User", back_populates="student_profile")
    parent_links = db.relationship("ParentStudentLink", back_populates="student")

    def __repr__(self):
        return f"<StudentProfile id={self.id} student_code={self.student_code} full_name={self.full_name!r}>"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "student_code": self.student_code,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "bio": self.bio,
            "joined_at": self.joined_at.isoformat() if self.joined_at is not None else None,
        }
