from flask import Blueprint, request, jsonify , redirect , url_for , session
from app.extensions import db, ph
from app.models import User , TeacherProfile
from marshmallow import ValidationError
from app.blueprints.auth.schema import LoginSchema, RegisterSchema , ForgotPasswordSchema , ResetPasswordSchema
from app.utils.emails import send_confirmation_url, send_password_reset_url, get_serializer
from app.config import DevelopmentConfig , ProductionConfig
from flask_login import login_user , login_required , current_user , logout_user
from app.utils.decorators import roles_required
import random 
from datetime import datetime
from argon2.exceptions import VerifyMismatchError
from app.oauth import oauth
import os
from flask import current_app


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
    session['user_id'] = str(user.id)
    session.permanent = True
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Debug: log request origin and cookies so we can trace missing session issues
    try:
        current_app.logger.info(
            f"[AUTH LOGIN] origin={request.headers.get('Origin')} cookies={dict(request.cookies)} user_id={user.id} role={user.role}"
        )
    except Exception:
        print("[AUTH LOGIN] debug:", request.headers.get('Origin'), dict(request.cookies), user.id, user.role)

    return jsonify({"message" : "Login successful" , 
                    "user" : {
                        "id" : user.id , 
                        "email" : user.email , 
                        "role" : user.role , 
                    }
                    }) , 200


@auth_bp.route("/check_profile", methods=["GET"])
def check_profile():
    # If user is not authenticated, report that no profile exists.
    if not getattr(current_user, "is_authenticated", False):
        return jsonify({"profile_exists": False}), 200

    role = getattr(current_user, "role", None)
    profile_attr_map = {
        "student": "student_profile",
        "teacher": "teacher_profile",
        "parent": "parent_profile"
    }
    profile_attr = profile_attr_map.get(role)
    profile = getattr(current_user, profile_attr, None)

    return jsonify({"profile_exists": bool(profile)}), 200

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

    send_confirmation_url(user)

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
        send_password_reset_url(user) 
        
        return jsonify({"message" : "Password reset email was sent"})   , 200




# ----------------------------- RESET PASSWORD --------------------------------------------------------

@auth_bp.route("/reset_password/<token>" , methods=['POST'])
def reset_password(token):
    try: 
        serializer = get_serializer()
        email = serializer.loads(token , salt=ProductionConfig.PASSWORD_RESET_SALT , max_age=3600)
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
        serializer = get_serializer()
        email = serializer.loads(token , salt=ProductionConfig.EMAIL_TOKEN_SALT , max_age=3600)
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
    # ensure session keys are set after confirmation login
    session['role'] = user.role
    session['user_id'] = str(user.id)
    session.permanent = True

    return jsonify({"message": "Email confirmed successfully" , 
                    "role_id" : student_id }), 200


# Debug endpoint: return whether the incoming request is authenticated
@auth_bp.route('/status', methods=['GET'])
def auth_status():
    try:
        return jsonify({
            'authenticated': bool(getattr(current_user, 'is_authenticated', False)),
            'user_id': getattr(current_user, 'id', None),
            'role': getattr(current_user, 'role', None)
        }), 200
    except Exception:
        return jsonify({'authenticated': False}), 200


# Debug: echo request cookies and headers to help diagnose cross-site cookie issues
@auth_bp.route('/debug/request', methods=['GET'])
def debug_request():
    try:
        cookies = dict(request.cookies)
    except Exception:
        cookies = {}
    # Pick a few headers useful for diagnosing CORS/cookie issues
    hdrs = {
        'Origin': request.headers.get('Origin'),
        'Referer': request.headers.get('Referer'),
        'CookieHeader': request.headers.get('Cookie'),
        'User-Agent': request.headers.get('User-Agent')
    }
    return jsonify({
        'authenticated': bool(getattr(current_user, 'is_authenticated', False)),
        'user_id': getattr(current_user, 'id', None),
        'cookies_received': cookies,
        'headers': hdrs
    }), 200


@auth_bp.route('/debug/config', methods=['GET'])
def debug_config():
    # Return server cookie-related configuration so we can verify what's active
    cfg = {
        'SESSION_COOKIE_SAMESITE': current_app.config.get('SESSION_COOKIE_SAMESITE'),
        'SESSION_COOKIE_SECURE': current_app.config.get('SESSION_COOKIE_SECURE'),
        'REMEMBER_COOKIE_SAMESITE': current_app.config.get('REMEMBER_COOKIE_SAMESITE'),
        'REMEMBER_COOKIE_SECURE': current_app.config.get('REMEMBER_COOKIE_SECURE'),
        'ENFORCE_SAMESITE_NONE': current_app.config.get('ENFORCE_SAMESITE_NONE'),
        'SESSION_COOKIE_DOMAIN': current_app.config.get('SESSION_COOKIE_DOMAIN'),
        'FRONTEND_URL': current_app.config.get('FRONTEND_URL'),
        'CORS_ORIGINS_ENV': os.getenv('CORS_ORIGINS')
    }
    return jsonify(cfg), 200


#----------------------------- logout -----------------------------------
@auth_bp.route("/logout" , methods=["GET" , "POST"])
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({"message" : "Logged out successfully"})


# ----------------------------- OAUTH START ------------------------------------------------
@auth_bp.route('/oauth/<provider>')
def oauth_login(provider):
    role = request.args.get('role', 'student')
    # front-end URL to return to after flow completes (optional)
    next_url = request.args.get('next') or os.getenv('FRONTEND_URL', 'http://localhost:5173')
    # Store values in session to avoid adding query params to redirect_uri (prevents redirect_uri_mismatch)
    session['oauth_role'] = role
    session['oauth_next'] = next_url
    redirect_uri = url_for('auth.oauth_callback', provider=provider, _external=True)
    # Log the redirect URI and stored session values for debugging redirect_uri_mismatch issues
    try:
        current_app.logger.info(f"[OAUTH] provider={provider} redirect_uri={redirect_uri} role={role} next={next_url}")
    except Exception:
        print(f"[OAUTH] provider={provider} redirect_uri={redirect_uri} role={role} next={next_url}")
    if provider == 'google':
        return oauth.google.authorize_redirect(redirect_uri)
    if provider == 'github':
        return oauth.github.authorize_redirect(redirect_uri)
    return jsonify({'message': 'Unsupported provider'}), 400


@auth_bp.route('/oauth/<provider>/callback')
def oauth_callback(provider):
    # provider callback: fetch token and user info, create or login user
    # retrieve role/next from session (set in oauth_login) to avoid relying on query params
    role = session.pop('oauth_role', request.args.get('role', 'student'))
    next_url = session.pop('oauth_next', None) or os.getenv('FRONTEND_URL', 'http://localhost:5173')
    try:
        current_app.logger.info(f"[OAUTH CALLBACK] provider={provider} role={role} next={next_url}")
    except Exception:
        print(f"[OAUTH CALLBACK] provider={provider} role={role} next={next_url}")

    try:
        if provider == 'google':
            token = oauth.google.authorize_access_token()
            user_info = oauth.google.parse_id_token(token)
            email = user_info.get('email')
            name = user_info.get('name')
        elif provider == 'github':
            token = oauth.github.authorize_access_token()
            resp = oauth.github.get('user', token=token)
            profile = resp.json()
            # fetch primary email if not public
            email = profile.get('email')
            if not email:
                emails = oauth.github.get('user/emails', token=token).json()
                primary = next((e for e in emails if e.get('primary') and e.get('verified')), None)
                email = primary.get('email') if primary else emails[0].get('email')
            name = profile.get('name') or profile.get('login')
        else:
            return jsonify({'message': 'Unsupported provider'}), 400
    except Exception as e:
        return jsonify({'message': 'OAuth failed', 'error': str(e)}), 400

    if not email:
        return jsonify({'message': 'No email returned by provider'}), 400

    # find or create user
    user = User.query.filter_by(email=email).first()
    created = False
    if not user:
        # create new user and mark email confirmed
        user = User(email=email, username=(name or email.split('@')[0]), password=os.urandom(16).hex(), role=role, email_confirmed=True)
        db.session.add(user)
        db.session.commit()
        created = True

    # login user
    login_user(user, remember=True)
    session['role'] = user.role
    session['user_id'] = str(user.id)
    session.permanent = True

    # redirect to frontend next_url so front-end can check profile
    return redirect(next_url)