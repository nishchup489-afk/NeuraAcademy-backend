from flask import Blueprint, request, jsonify , redirect , url_for
from app.extensions import db, ph
from app.blueprints.auth.models import User
from marshmallow import ValidationError
from app.blueprints.auth.schema import LoginSchema, RegisterSchema , ForgotPasswordSchema , ResetPasswordSchema
from app.utils.emails import send_confirmation_token , serializer , send_password_reset_token
from app.config import DevelopmentConfig




auth_bp = Blueprint("auth" , __name__ , url_prefix="/api/auth")
login_schema = LoginSchema()
register_schema = RegisterSchema()
forgot_password_schema = ForgotPasswordSchema()
reset_password_schema = ResetPasswordSchema()


#TODO: ADD TIMESTAMPS
# ----------------------------- LOGIN --------------------------------------------------------
@auth_bp.route("/login" , methods=['POST'])
def login():
    try:
        data = login_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    user = User.query.filter_by(email = data['email']).first()

    if not user:
        return jsonify({"message" : "User not found"}) , 404
    if not user.confirmed:
        return jsonify({"message": "Please confirm your email first"}), 403

    
    try:
        ph.verify(user.password, data["password"])
    except VerifyMismatchError as e:
        return jsonify({"message": "Wrong password"}), 400
    
    return jsonify({"message" : "Login successful"}) , 200




# ----------------------------- REGISTER --------------------------------------------------------
@auth_bp.route("/register" , methods=['POST'])
def register():
    try:
        data = register_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    existing = User.query.filter_by(email = data['email']).first()
    if existing:
        return jsonify({"message": "Email already exist"}) , 409
    

    hashed = ph.hash(data['password'])
    user = User(email = data['email'] , username= data['username'], password = hashed)

    db.session.add(user)
    db.session.commit()
    send_confirmation_token(user)

    return jsonify({"message" : "Check your email to confirm your account"}) , 201




# ----------------------------- FORGOT PASSWORD --------------------------------------------------------

@auth_bp.route("/forgot_password" , methods=['POST'])
def forgot_password():
    try:
        data = forgot_password_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages) , 400
    
    user = User.query.filter_by(email = data['email']).first()

    if not user:
        return jsonify({"message": "If the email exists, a reset link was sent"}) , 200
    if not user.confirmed: 
        return jsonify({"message" : "The email was never confirmed"}) , 403

    if user:
        send_password_reset_token(user) 
        
        return jsonify({"message" : "Password reset email was sent"})   , 200




# ----------------------------- RESET PASSWORD --------------------------------------------------------

@auth_bp.route("/reset_password/<token>" , methods=['POST'])
def reset_password(token):
    try: 
        email = serializer.loads(token , salt=DevelopmentConfig.PASSWORD_RESET_SALT , max_age=3600)
    except Exception as err:
        return jsonify({"message": "Invalid or expired token"}) , 401
    
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message" : "User not found"}) , 404
    
    try:
        data = reset_password_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages) , 400

    hashed = ph.hash(data['password'])
    user.password = hashed
    db.session.commit()
    return jsonify({"message" : "Password was reset"})


# ----------------------------- CONFIRM EMAIL  --------------------------------------------------------

@auth_bp.route("/confirm/<token>" , methods=['GET'])
def confirm(token):
    try:
        email = serializer.loads(token , salt=DevelopmentConfig.EMAIL_TOKEN_SALT , max_age=3600)
    except Exception as e:
        return jsonify({"message" : "Invalid or expired token"}) , 401
    
    user = User.query.filter_by(email = email).first()

    if not user:
        return jsonify({"message" : "Invalid User"}) , 404
    if user.confirmed:
        return jsonify({"message" : "User already confirmed"}) , 200
    
    user.confirmed = True
    db.session.commit()
    return jsonify({"message": "Email confirmed successfully"}), 200
