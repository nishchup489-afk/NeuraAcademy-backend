from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID


class AdminAccess(db.Model):
    __tablename__ = "admin_access"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=(uuid.uuid4))
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id") , default=uuid.uuid4)
    secret_key_hash = db.Column(db.String(200))
    secret_phrase_hash = db.Column(db.String(200))
    granted_at = db.Column(db.DateTime, default=db.func.now())
