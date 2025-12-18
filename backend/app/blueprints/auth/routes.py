from flask import Blueprint , request , jsonify
from extensions import db , ph
from models import User
from marshmallow import ValidationError
from auth.schema import LoginSchema , RegisterSchema

auth_bp = Blueprint("auth" , __name__ , url_prefix="/api/auth")
login_schema = LoginSchema()
register_schema = RegisterSchema()

@auth_bp.route("/login" , methods=['POST'])
def login():
    try:
        data = login_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    user = User.query.filter_by(email = data['email']).first()

    if not user:
        return jsonify({"message" : "User not found"}) , 404
    
    if not ph.verify(user.password , data['password']):
        return jsonify({"message" : "Wrong password"}) , 400
    
    return jsonify({"message" : "Login successful"}) , 200



@auth_bp.route("/register" , methods=['POST'])
def register():
    try:
        data = register_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    existing = User.query.filter_by(data['email']).first()
    if existing:
        return jsonify({"message": "Email already exist"}) , 409
    

    hashed = ph.hash(data['password'])
    user = User(email = data['email'] , username= data['username'], password = hashed)

    db.session.add(user)
    db.session.commit()




