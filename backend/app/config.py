import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class BaseConfig:
    DEBUG = False
    TESTING = False

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secrets & salts
    SECRET_KEY = os.getenv("SECRET_KEY")
    SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT")
    PASSWORD_RESET_SALT = os.getenv("PASSWORD_RESET_SALT")
    EMAIL_TOKEN_SALT = os.getenv("EMAIL_TOKEN_SALT")

    # Frontend
    FRONTEND_URL = os.getenv("FRONTEND_URL")

    # Flask-Mail (DEV fallback)
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False

    # SendGrid (PRIMARY)
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")

    # Session
    SESSION_COOKIE_NAME = "neuraacademy_session"
    SESSION_COOKIE_HTTPONLY = True
    # Use the string 'None' to ensure browsers send the cookie for cross-site requests
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_DOMAIN = None
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # OAuth
    OAUTHLIB_INSECURE_TRANSPORT = True


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class ProductionConfig(BaseConfig):
    SESSION_COOKIE_SECURE = True
    OAUTHLIB_INSECURE_TRANSPORT = False


class TestingConfig(BaseConfig):
    TESTING = True
