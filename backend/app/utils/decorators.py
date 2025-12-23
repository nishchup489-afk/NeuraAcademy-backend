from functools import wraps
from flask import jsonify
from flask_login import current_user

def roles_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorators_view(*args , **kwargs):
            if not current_user.is_authenticated:
                return jsonify({"error" : "Login required"}) , 401
            if current_user.role not in roles:
                return jsonify({"message" : "Permission denied"}) , 403
            return fn(*args , **kwargs)
        return decorators_view
    return wrapper