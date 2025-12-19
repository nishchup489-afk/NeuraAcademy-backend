from marshmallow import Schema , fields , validate , validates_schema , ValidationError

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True , validate=validate.Length(min=8))
    
class RegisterSchema(Schema):
    email = fields.Email(required=True)
    username = fields.String(required=True)
    password = fields.String(required=True , validate=validate.Length(min=8))
    confirm_password = fields.String(required=True , validate=validate.Length(min=8))

    @validates_schema
    def validate_password(self , data , **kwargs):
        if data['password'] != data['confirm_password']:
             raise ValidationError("Passwords do not match", field_name="confirm_password")

class ForgotPasswordSchema(Schema):
    email = fields.Email(required=True)

class ResetPasswordSchema(Schema):
    password = fields.String(required=True , validate=validate.Length(min=8))
    confirm_password = fields.String(required=True , validate=validate.Length(min=8))
    @validates_schema
    def validate_password(self , data , **kwargs):
        if data['password'] != data['confirm_password']:
             raise ValidationError("Passwords do not match", field_name="confirm_password")
