from marshmallow import fields , Schema , validate , validates_schema , ValidationError

class TeacherSchema(Schema):
    platform_name = fields.String(required=True)
    education_info = fields.String(required=True)
    years_experience = fields.Integer(required=True , strict=False)
    