from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_limiter import Limiter
from flask_login import LoginManager
from flask_limiter.util import get_remote_address
from argon2 import PasswordHasher
from flask_cors import CORS





db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
login_manager = LoginManager()
cors = CORS()
ph = PasswordHasher(
    time_cost=2,
    memory_cost=102400 ,
    parallelism=8
)
limiter = Limiter(
    key_func=get_remote_address , 
    default_limits= ["200 per hour"]
)

login_manager.login_message_category = "info"