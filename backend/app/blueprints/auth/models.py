from app.extensions import db , login_manager
from flask_login import UserMixin
from datetime import datetime , timedelta
import uuid
from sqlalchemy.dialects.postgresql import UUID

class User(UserMixin , db.Model):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True) , primary_key = True , default= uuid.uuid4)
    email = db.Column(db.String(200) , nullable=False , unique=True)
    username = db.Column(db.String(100) , nullable=False)
    password = db.Column(db.String(200) , nullable=False)
    confirmed = db.Column(db.Boolean , default=False)
    role = db.Column(db.String(50) , default="user" )
    timestamp = db.Column(db.DateTime , default = datetime.now)

class FailedLogin(db.Model):
    id = db.Column(UUID(as_uuid=True) , primary_key = True , default = uuid.uuid4)
    email = db.Column(db.String(200) , unique=True , nullable = False)
    timestamp = db.Column(db.DateTime , default = datetime.now)
    ip = db.Column(db.String(50))


