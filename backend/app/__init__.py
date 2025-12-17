from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from extensions import db , migrate , mail , login_manager , cors , ph , limiter
from config import BaseConfig , TestingConfig , ProductionConfig , DevelopmentConfig
from flask_talisman import Talisman
import os

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
    login_manager.login_view = "auth.login"
    login_manager.session_protection = "strong"


    # TODO: use Redis in production


    return app
