from marshmallow import Schema, fields

class TeacherSchema(Schema):
    # base fields
    first_name = fields.String(required=False)
    last_name = fields.String(required=False)
    date_of_birth = fields.String(required=False)
    country = fields.String(required=False)
    country_code = fields.String(required=False)
    phone = fields.String(required=False)
    bio = fields.String(required=False)
    github = fields.String(required=False)
    linkedin = fields.String(required=False)
    facebook = fields.String(required=False)
    x = fields.String(required=False)
    instagram = fields.String(required=False)
    
    # teacher-specific fields
    platform_name = fields.String(required=False)
    education_info = fields.String(required=False)
    years_experience = fields.Integer(required=False)
