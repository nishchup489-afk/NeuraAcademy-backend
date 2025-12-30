from dotenv import load_dotenv
load_dotenv()
from flask import Flask, current_app , jsonify
from .extensions import db , migrate , mail , login_manager , cors , ph , limiter
from .config import BaseConfig , TestingConfig , ProductionConfig , DevelopmentConfig
from flask_talisman import Talisman
import os
from app.models import User
from uuid import UUID

def create_app(config_name = "deploy"):
    app = Flask(__name__)

    if config_name == "dev":
        app.config.from_object(DevelopmentConfig)
    elif config_name == "test":
        app.config.from_object(TestingConfig)
    elif config_name == "deploy":
        app.config.from_object(ProductionConfig)

    # If server-side enforcement for SameSite=None is enabled, ensure Flask
    # cookie config values are explicitly set so responses use SameSite=None
    # and Secure for cross-site cookies.
    if app.config.get("ENFORCE_SAMESITE_NONE"):
        app.config["SESSION_COOKIE_SAMESITE"] = 'None'
        app.config["SESSION_COOKIE_SECURE"] = True
        app.config["REMEMBER_COOKIE_SAMESITE"] = 'None'
        app.config["REMEMBER_COOKIE_SECURE"] = True

    @app.route("/", methods=["GET", "HEAD"])
    def health():
        return {"status": "ok", "service": "NeuraAcademy API"}, 200

    

    # cors origin(s) - trim whitespace and include FRONTEND_URL if set
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    origin = [o.strip() for o in raw_origins.split(",") if o.strip()]
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        fu = frontend_url.strip()
        if fu and fu not in origin:
            origin.append(fu)

    #initialization 
    db.init_app(app)
    migrate.init_app(app , db)
    mail.init_app(app)
    login_manager.init_app(app)
    cors.init_app(app, supports_credentials=True, origins=origin)
    limiter.init_app(app)
    Talisman(app, content_security_policy=None)


    # login manager 
    login_manager.login_view = None
    login_manager.session_protection = "strong"

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"message": "Authentication required"}), 401

        

    @login_manager.user_loader
    def load_user(user_id):
        # Robust loader: try direct get, attempt UUID conversion, then fallback to query
        try:
            current_app.logger.info(f"[LOAD_USER] raw_id={user_id} type={type(user_id)}")
        except Exception:
            pass

        try:
            # direct get (works when id type matches PK type)
            user = db.session.get(User, user_id)
            if user:
                return user
        except Exception:
            # ignore and try fallbacks
            pass

        # try converting to UUID instance (some DB PKs are UUID objects)
        try:
            uid = UUID(str(user_id))
            try:
                user = db.session.get(User, uid)
                if user:
                    return user
            except Exception:
                pass
        except Exception:
            pass

        # final fallback: query by string representation
        try:
            return User.query.filter_by(id=str(user_id)).first()
        except Exception:
            return None



    # TODO: use Redis in production

    #blueprints
    from .blueprints.auth.routes import auth_bp
    from .oauth import init_oauth
    from .blueprints.student.student_dashboard import student_bp
    from .blueprints.profile.routes import profile_bp
    from .blueprints.courses.routes import register_course_blueprints
    from .blueprints.student.routes import student_bp as student_api_bp
    from .blueprints.chatbot.routes import chatbot_bp
    from .blueprints.student.student_exam_routes import student_exam_bp


    init_oauth(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(student_api_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(chatbot_bp)
    register_course_blueprints(app)
    app.register_blueprint(student_exam_bp)

    # Enforce SameSite=None; Secure on cookies when configured to do so.
    # Some hosting environments or proxies can rewrite cookie attributes; this
    # hook ensures cross-site cookies are usable for the SPA when in production.
    if app.config.get("ENFORCE_SAMESITE_NONE"):
        @app.after_request
        def rewrite_samesite_secure(response):
            cookies = response.headers.getlist("Set-Cookie")
            if not cookies:
                return response
            new_cookies = []
            for c in cookies:
                # remove existing SameSite and Secure attributes and re-append them
                parts = [p for p in c.split(";") if not p.strip().lower().startswith("samesite=") and p.strip().lower() != "secure"]
                # ensure SameSite=None and Secure present
                parts.append("SameSite=None")
                parts.append("Secure")
                new_cookies.append("; ".join(parts))

            # remove all Set-Cookie and re-add
            del response.headers["Set-Cookie"]
            for nc in new_cookies:
                response.headers.add("Set-Cookie", nc)
            return response

    return app
