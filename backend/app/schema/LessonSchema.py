# app/schema/lesson.py
from marshmallow import Schema, fields, validate

class LessonSchema(Schema):
    chapter_id = fields.UUID(required=True)
    title = fields.String(required=True, validate=validate.Length(min=4))
    order = fields.Integer(required=True)
    status = fields.String(
        load_default="draft",
        validate=validate.OneOf(["draft", "published", "archived"])
    )

    content = fields.Dict(required=True)
