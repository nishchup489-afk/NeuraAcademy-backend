from app.extensions import db 
from datetime import datetime , timedelta
import uuid
from sqlalchemy.dialects.postgresql import UUID
from flask_login import UserMixin

class StudentProfile(db.Model):
    __tablename__ = "student_profile"

    id = db.Column(UUID(as_uuid=True) , primary_key = True , default= uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True) , db.ForeignKey("users.id") , unique=True , nullable=False )

    first_name = db.Column(db.String(100) , nullable=False )
    last_name = db.Column(db.String(100) , nullable=False )

    date_of_birth = db.Column(db.Date)

    country = db.Column(db.String(50))
    country_code = db.Column(db.String(20) , default = "+1")

    avatar = db.Column(db.String(255))

    phone = db.Column(db.String(30))

    bio = db.Column(db.Text)

    github = db.Column(db.String(255))
    facebook = db.Column(db.String(255))
    x = db.Column(db.String(255))
    linkedin = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    updated_at = db.Column(db.DateTime , default = datetime.utcnow , onupdate = datetime.utcnow)

    user = db.relationship(
        "User" , 
        back_populates = "profile",
    )


