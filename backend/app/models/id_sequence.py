from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID


class IDSequence(db.Model):
    __tablename__ = "id_sequences"

    role = db.Column(UUID(as_uuid = True), default=uuid.uuid4 , primary_key=True)
    current_value = db.Column(db.Integer, default=0)
