import os
from app import create_app

# Default to development config when running locally. Set APP_CONFIG=deploy for production.
config_name = os.getenv("APP_CONFIG", "dev")
app = create_app(config_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

