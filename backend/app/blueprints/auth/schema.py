from marshmallow import Schema , fields , validate , validates_schema , ValidationError

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True , validate=validate.Length(min=8))
    
class RegisterSchema(Schema):
    email = fields.Email(required=True)
    username = fields.String(required=True)
    password = fields.String(required=True , validate=validate.Length(min=8))
    confirmed = fields.String(required=True , validate=validate.Length(min=8))

    @validates_schema
    def validate_password(self , data , **kwargs):
        if data['password'] != data['confirmed']:
             raise ValidationError("Passwords do not match", field_name="confirmed")
