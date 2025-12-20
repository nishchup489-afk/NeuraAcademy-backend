import os 
from dotenv import load_dotenv
from datetime import timedelta
load_dotenv()

class BaseConfig: 

    # BASE
    DEBUG = False
    TESTING = False
    ENV = os.getenv("FLASK_ENV", "development")



    #DATABASE
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    SQLALCHEMY_TRACK_MODIFICATIONS  = False


    #ALL SALT AND SECRET
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "dev-security-salt")
    PASSWORD_RESET_SALT = os.getenv("PASSWORD_RESET_SALT", "dev-reset-salt")

    #MAIL THINGS
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False

    #MAIL SALT
    EMAIL_TOKEN_SALT = os.getenv("EMAIL_TOKEN_SALT" , "dev-email-salt")

    #CAPTCHA 
    RECAPTCHA_PUBLIC_KEY = os.getenv("RECAPTCHA_PUBLIC_KEY")
    RECAPTCHA_PRIVATE_KEY = os.getenv("RECAPTCHA_PRIVATE_KEY")

    #SESSION
    SESSION_COOKIE_NAME = "neuraacademy_session"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_DOMAIN = "localhost"
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    #CORS
    CORS_SUPPORTS_CREDENTIALS  = True

    #Oauth
    OAUTHLIB_INSECURE_TRANSPORT = True





class DevelopmentConfig(BaseConfig):
    DEBUG = True
    FRONTEND_URL = "http://localhost:5173"


class ProductionConfig(BaseConfig):
    SESSION_COOKIE_SECURE = True
    OAUTHLIB_INSECURE_TRANSPORT = False

class TestingConfig(BaseConfig):
    TESTING = True
