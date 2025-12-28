from flask import Blueprint , jsonify , request , current_app
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
    try:
        current_app.logger.info(
            f"[PROFILE] origin={request.headers.get('Origin')} cookies={dict(request.cookies)} auth={getattr(current_user, 'is_authenticated', False)} user_id={getattr(current_user, 'id', None)} role={getattr(current_user, 'role', None)}"
        )
    except Exception:
        print("[PROFILE] debug:", request.headers.get('Origin'), dict(request.cookies), getattr(current_user, 'is_authenticated', False), getattr(current_user, 'id', None), getattr(current_user, 'role', None))
    if allowed_role and current_user.role != allowed_role:
        return jsonify({"error": "Unauthorized role"}), 403

    
    role_to_profile_attr = {
        "student": "student_profile",
        "teacher": "teacher_profile",
        "parent": "parent_profile"
    }

    profile_attr = role_to_profile_attr.get(current_user.role)
    profile = getattr(current_user, profile_attr)

    if request.method == "GET":
        if not profile:
            return jsonify({"message": "No profile found"}), 404
        return jsonify(schema.dump(profile)), 200

    avatar_url = None
    try: 
        data = schema.load(request.form)
    except ValidationError as e:
        return jsonify(e.messages) , 400

    avatar_file = request.files.get("avatar")

    if avatar_file:
        avatar_url = upload_profile(
            file = avatar_file , 
            public_id= f"user_{current_user.id}_avatar"
        )
    if not profile:
        profile = model_class(user_id = current_user.id)

    for key , value in data.items():
        setattr(profile , key , value)
    
    if avatar_url:
        if hasattr(profile, 'avatar_url'):
            try:
                profile.avatar_url = avatar_url
            except Exception:
                setattr(profile, 'avatar', avatar_url)
        else:
            setattr(profile, 'avatar', avatar_url)
    
    if extra_fields_handlar:
        extra_fields_handlar(profile , data)

    if request.method == "GET":
        if not profile:
            return jsonify({"message": "No profile found"}), 404
        data = schema.dump(profile)
        print("DEBUG profile GET:", data)
        return jsonify(data), 200

    


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


# ---------------- Parent links & student approval endpoints ----------------
@profile_bp.route("/parent/links", methods=["GET"])
@login_required
def parent_links():
    if current_user.role != "parent":
        return jsonify({"error": "Parents only"}), 403

    profile = getattr(current_user, "parent_profile", None)
    if not profile:
        return jsonify({"links": []}), 200

    links = []
    for link in profile.student_links:
        student = link.student
        links.append({
            "id": str(link.id),
            "student_id": str(link.student_id),
            "student_name": f"{student.first_name} {student.last_name}" if student else None,
            "status": link.status,
            "requested_at": link.requested_at.isoformat() if link.requested_at else None,
            "approved_at": link.approved_at.isoformat() if link.approved_at else None
        })

    return jsonify({"links": links}), 200


@profile_bp.route("/student/parent_requests", methods=["GET"])
@login_required
def student_parent_requests():
    if current_user.role != "student":
        return jsonify({"error": "Students only"}), 403

    student = getattr(current_user, "student_profile", None)
    if not student:
        return jsonify({"requests": []}), 200

    requests = []
    for link in student.parent_links:
        if link.status == "pending":
            parent = link.parent
            requests.append({
                "id": str(link.id),
                "parent_id": str(link.parent_id),
                "parent_name": f"{parent.user.first_name} {parent.user.last_name}" if parent and parent.user else None,
                "parent_code": parent.parent_code if parent else None,
                "requested_at": link.requested_at.isoformat() if link.requested_at else None
            })

    return jsonify({"requests": requests}), 200


@profile_bp.route("/student/parent_requests/<uuid:link_id>/respond", methods=["POST"])
@login_required
def respond_parent_request(link_id):
    if current_user.role != "student":
        return jsonify({"error": "Students only"}), 403

    student = getattr(current_user, "student_profile", None)
    if not student:
        return jsonify({"error": "Student profile not found"}), 404

    link = db.session.query(ParentStudentLink).filter_by(id=link_id).first()
    if not link or str(link.student_id) != str(student.id):
        return jsonify({"error": "Request not found"}), 404

    data = request.get_json() or {}
    action = data.get("action")
    if action not in ("approve", "reject"):
        return jsonify({"error": "Invalid action"}), 400

    if action == "approve":
        link.status = "approved"
        link.approved_at = db.func.now()
    else:
        link.status = "rejected"

    db.session.add(link)
    db.session.commit()

    return jsonify({"message": f"Request {action}d"}), 200


