from flask import Blueprint , jsonify , request 
from app.extensions import db 
from app.utils.cloudinary import upload_profile
from app.blueprints.profile.models import StudentProfile
from app.blueprints.profile.schema import StudentProfileSchema
from marshmallow import ValidationError
from flask_login import login_required , current_user


profile_bp = Blueprint("profile" , __name__ , url_prefix="/api")
profile_schema = StudentProfileSchema()


#-------------------------profile section ------------------------------
@login_required
@profile_bp.route("/profile" , methods=['POST'])
def profile():
    
    avatar_url = None
    try: 
        data = profile_schema.load(request.form)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    
    avatar_file = request.files.get("avatar")
    avatar_url = None

    if avatar_file:
        avatar_url = upload_profile(
            file = avatar_file , 
            public_id= f"user_{current_user.id}_avatar"
        )

    profile = current_user.profile

    if not profile: 
        profile = StudentProfile(user_id = current_user.id)

    for key , value in data.items():
        setattr(profile , key , value)
    
    if avatar_url:
        profile.avatar = avatar_url



    db.session.add(profile)
    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully" , 
        "profile" : profile_schema.dump(profile) , 
        "role" : current_user.role
    })
