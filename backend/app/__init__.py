from dotenv import load_dotenv
load_dotenv()
from flask import Flask , jsonify
from .extensions import db , migrate , mail , login_manager , cors , ph , limiter
from .config import BaseConfig , TestingConfig , ProductionConfig , DevelopmentConfig
from flask_talisman import Talisman
import os
from app.models import User

def create_app(config_name = "dev"):
    app = Flask(__name__)

    if config_name == "dev":
        app.config.from_object(DevelopmentConfig)
    elif config_name == "test":
        app.config.from_object(TestingConfig)
    elif config_name == "deploy":
        app.config.from_object(ProductionConfig)
    

    #cors origin
    origin = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    #initialization 
    db.init_app(app)
    migrate.init_app(app , db)
    mail.init_app(app)
    login_manager.init_app(app)
    cors.init_app( app , supports_credentials=True , origins=origin)
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
        return db.session.get(User , (user_id))



    # TODO: use Redis in production

    #blueprints
    from .blueprints.auth.routes import auth_bp
    from .blueprints.student.student_dashboard import student_bp
    from .blueprints.profile.routes import profile_bp
    from .blueprints.courses.routes import register_course_blueprints
    from .blueprints.student.routes import student_bp as student_api_bp


    #register blueprint
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(student_api_bp)
    app.register_blueprint(profile_bp)
    register_course_blueprints(app)

    return app
