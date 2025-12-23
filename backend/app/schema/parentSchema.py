from marshmallow import fields , Schema , validate , validates_schema , ValidationError

class ParentSchema(Schema):
    parent_code = fields.Str(required=True, validate=validate.Length(min=4, max=20))
    student_id = fields.UUID(required=False)  # Optional, if linking a student
    action = fields.Str(required=False, validate=validate.OneOf(["link_request", "update"]))

    @validates_schema
    def check_student_id_for_link(self, data, **kwargs):
        if data.get("action") == "link_request" and not data.get("student_id"):
            raise ValidationError("student_id is required when requesting a link")