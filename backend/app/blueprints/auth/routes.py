from flask import Blueprint, request, jsonify , redirect , url_for , session
from app.extensions import db, ph
from app.models import User , TeacherProfile
from marshmallow import ValidationError
from app.blueprints.auth.schema import LoginSchema, RegisterSchema , ForgotPasswordSchema , ResetPasswordSchema
from app.utils.emails import send_confirmation_token , serializer , send_password_reset_token
from app.config import DevelopmentConfig
from flask_login import login_user , login_required , current_user , logout_user
from app.utils.decorators import roles_required
import random 
from datetime import datetime
from argon2.exceptions import VerifyMismatchError


auth_bp = Blueprint("auth" , __name__ , url_prefix="/api/auth")
login_schema = LoginSchema()
register_schema = RegisterSchema()
forgot_password_schema = ForgotPasswordSchema()
reset_password_schema = ResetPasswordSchema()


# ----------------------------- LOGIN --------------------------------------------------------

def login_with_role(expected_role):
    try:
        data = login_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    user = User.query.filter_by(email = data['email']).first()

    if not user:
        return jsonify({"message" : "User not found"}) , 404
    if not user.email_confirmed:
        return jsonify({"message": "Please confirm your email first"}), 403
    

    

    
    try:
        ph.verify(user.password, data["password"])
    except VerifyMismatchError as e: # type: ignore
        return jsonify({"message": "Wrong password"}), 400
    
    if user.role != expected_role: 
        return jsonify({"message" : f"This login is for {expected_role} only"}) , 403
    

    login_user(user , remember = True) 
    session['role'] = user.role
    session.permanent = True
    user.last_login = datetime.utcnow()
    db.session.commit()

    return jsonify({"message" : "Login successful" , 
                    "user" : {
                        "id" : user.id , 
                        "email" : user.email , 
                        "role" : user.role , 
                    }
                    }) , 200


@login_required
@auth_bp.route("/check_profile", methods=["GET"])
def check_profile():
    role = current_user.role
    profile_attr_map = {
        "student": "student_profile",
        "teacher": "teacher_profile",
        "parent": "parent_profile"
    }
    profile_attr = profile_attr_map.get(role)
    profile = getattr(current_user, profile_attr, None)
    
    return jsonify({
        "profile_exists": bool(profile)
    }), 200

# ------------------------------------- student login --------------------------------
@auth_bp.route("/login/student" , methods=['POST'])
def login_student():
    return login_with_role("student")

# ------------------------------------- parents login ----------------------------------

@auth_bp.route("/login/teacher" , methods=['POST'])
def login_teacher():
    return login_with_role("teacher")


# -------------------------------------- admin login ------------------------------------
@auth_bp.route("/login/admin" , methods=['POST'])
def login_admin():
    return login_with_role("admin")

# -------------------------------------- parent login ------------------------------------
@auth_bp.route("/login/parent" , methods=['POST'])
def login_parent():
    return login_with_role("parent")





# ----------------------------- REGISTER --------------------------------------------------------
def register_with_role(expected_role):
    try:
        data = register_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 409

    hashed = ph.hash(data["password"])

    user = User(
        email=data["email"],
        username=data["username"],
        password=hashed,
        role=expected_role, 
        
    )

    db.session.add(user)
    db.session.commit()

    send_confirmation_token(user)

    return jsonify({
        "message": "Check your email to confirm your account"
    }), 201

# ----------------------------- REGISTER STUDENT --------------------------------------------------------
@auth_bp.route("/register/student" , methods=['POST'])
def register_student():
    return register_with_role("student")

# ----------------------------- REGISTER TEACHER --------------------------------------------------------
@auth_bp.route("/register/teacher" , methods=['POST'])
def register_teacher():
    return register_with_role("teacher")

# ----------------------------- REGISTER PARENT --------------------------------------------------------
@auth_bp.route("/register/parent" , methods=['POST'])
def register_parent():
    return register_with_role("parent")





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
    if not user.email_confirmed: 
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
    if user.email_confirmed:
        return jsonify({"message" : "User already confirmed"}) , 200
    
    user.email_confirmed = True
    student_id = random.randint(10**9 , 10**10 -1)
    user.role_id = student_id
    db.session.commit()
    login_user(user)

    return jsonify({"message": "Email confirmed successfully" , 
                    "role_id" : student_id }), 200


#----------------------------- logout -----------------------------------
@auth_bp.route("/logout" , methods=["GET" , "POST"])
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({"message" : "Logged out successfully"})