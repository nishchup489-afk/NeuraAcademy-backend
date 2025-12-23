from flask import Blueprint , jsonify , request 
from app.extensions import db 
from app.utils.cloudinary import upload_profile
from app.models import StudentProfile , TeacherProfile , ParentProfile , ParentStudentLink
from app.schema import StudentProfileSchema , TeacherSchema , ParentSchema
from marshmallow import ValidationError
from flask_login import login_required , current_user


profile_bp = Blueprint("profile" , __name__ , url_prefix="/api")

student_profile_model = StudentProfile
teacher_profile_model = TeacherProfile
parent_profile_model = ParentProfile
parent_student_link_model = ParentStudentLink

student_schema = StudentProfileSchema()
teacher_schema = TeacherSchema()
parent_schema = ParentSchema()


#------------------------- Base profile ------------------------------

def handle_profile_update( * , 
                          schema , 
                          model_class ,
                          allowed_role ,
                          extra_fields_handlar = None  ):
    if allowed_role and current_user.role != allowed_role:
        return jsonify({"error": "Unauthorized role"}), 403

    
    avatar_url = None
    try: 
        data = schema.load(request.form)
    except ValidationError as e:
        return jsonify(e.messages) , 400
    
    
    avatar_file = request.files.get("avatar")
    avatar_url = None

    if avatar_file:
        avatar_url = upload_profile(
            file = avatar_file , 
            public_id= f"user_{current_user.id}_avatar"
        )
    role_to_profile_attr = {
        "student": "student_profile",
        "teacher": "teacher_profile",
        "parent": "parent_profile"
    }

    profile_attr = role_to_profile_attr.get(current_user.role)
    profile = getattr(current_user, profile_attr)


    if not profile: 
        profile = model_class(user_id = current_user.id)

    for key , value in data.items():
        setattr(profile , key , value)
    
    if avatar_url:
        profile.avatar = avatar_url
    
    if extra_fields_handlar:
        extra_fields_handlar(profile , data)
    


    db.session.add(profile)
    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully" , 
        "profile" : schema.dump(profile) , 
        "role" : current_user.role
    })


# -------------------------------------- student profile -------------------------------------
@profile_bp.route("/student/profile" , methods=["POST" , "GET"])
@login_required
def student_profile():
    print("AUTH:", current_user.is_authenticated, current_user.role)
    # if current_user.role != "student":
    #     return jsonify({"error": "Students only"}), 403
    return handle_profile_update(
        schema= student_schema , 
        model_class= StudentProfile , 
        allowed_role= None
    )


@profile_bp.route("/teacher/profile" , methods= ["POST" , "GET"])
@login_required
def teacher_profile():
    return handle_profile_update(
        schema= teacher_schema  ,
        model_class= teacher_profile_model , 
        allowed_role= "teacher"
    ) 

@profile_bp.route("/parent/profile", methods=["POST", "GET"])
@login_required
def parent_profile():
    if current_user.role != "parent":
        return jsonify({"error": "Parents only"}), 403


    if request.method == "GET":
        profile = getattr(current_user, "parent_profile", None)
        if not profile:
            return jsonify({"message": "No profile found"}), 404
        return jsonify(parent_schema.dump(profile))

    try:
        data = parent_schema.load(request.form)
    except ValidationError as e:
        return jsonify(e.messages), 400

    # Fetch or create parent profile
    profile = getattr(current_user, "parent_profile")
    if not profile:
        profile = ParentProfile(user_id=current_user.id, parent_code=data["parent_code"])

    profile.parent_code = data["parent_code"]

    db.session.add(profile)
    db.session.commit()

    # Handle linking to student
    if data.get("action") == "link_request" and data.get("student_id"):
        student = db.session.query(StudentProfile).filter_by(id=data["student_id"]).first()
        if not student:
            return jsonify({"error": "Invalid student ID"}), 400

        # Check if link already exists
        existing_link = db.session.query(ParentStudentLink).filter_by(
            parent_id=profile.id, student_id=data["student_id"]
        ).first()
        if not existing_link:
            link = ParentStudentLink(parent_id=profile.id, student_id=data["student_id"])
            db.session.add(link)
            db.session.commit()



    return jsonify({
        "message": "Parent profile updated successfully",
        "profile": parent_schema.dump(profile)
    })
