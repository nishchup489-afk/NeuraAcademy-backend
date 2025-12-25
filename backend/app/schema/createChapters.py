from marshmallow import fields , Schema ,  validate , validates_schema , ValidationError

class ChapterSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=4))
    order = fields.Integer(required=True)
    description = fields.String()
    status = fields.String(
        load_default="draft",
        validate=validate.OneOf(["draft", "published", "archived"])
    )

class CreateChaptersSchema(Schema):
    chapters = fields.List(
        fields.Nested(ChapterSchema),
        required=True,
        validate=validate.Length(min=1)  # ensures at least 1 chapter
    )
