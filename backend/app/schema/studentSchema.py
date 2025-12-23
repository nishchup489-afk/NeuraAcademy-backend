from marshmallow import Schema , fields , validate , validates_schema , ValidationError

class StudentProfileSchema(Schema):
    first_name = fields.String(required=True)
    last_name = fields.String(required=True)

    date_of_birth = fields.Date(required=True)

    country_code = fields.String(required=True , validate= validate.Length(max=5))
    country = fields.String()

    avatar = fields.Url(dump_only=True)

    phone = fields.String(validate=validate.Length(max=30))
    bio = fields.String()

    github = fields.Url()
    facebook = fields.Url()
    x = fields.Url()
    linkedin = fields.Url()
    instagram = fields.Url()