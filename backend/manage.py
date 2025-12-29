import os
from app import create_app
from app.extensions import db
from flask_migrate import Migrate

# Allow selecting configuration via `APP_CONFIG` env var (dev/test/deploy).
# Default to `dev` so local development runs do not set Secure-only cookies.
config_name = os.getenv("APP_CONFIG", "dev")
app = create_app(config_name)
migrate = Migrate(app, db)


