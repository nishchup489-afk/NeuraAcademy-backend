# app/blueprints/course/course_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Course
from app.extensions import db
from app.utils.decorators import roles_required

course_bp = Blueprint("course", __name__, url_prefix="/api/teacher/courses")


@course_bp.route("", methods=["POST"])
@login_required
@roles_required("teacher")
def create_course():
    data = request.get_json()

    course = Course(
        teacher_id=current_user.teacher_profile.id,
        title=data["title"],
        description=data.get("description", ""),
        price=data.get("price", 0),
        currency=data.get("currency", "USD"),
        status="draft"
    )

    db.session.add(course)
    db.session.commit()

    return jsonify({
        "course_id": str(course.id)
    }), 201


@course_bp.route("", methods=["GET"])
@login_required
@roles_required("teacher")
def list_teacher_courses():
    courses = Course.query.filter_by(
        teacher_id=current_user.teacher_profile.id
    ).all()

    return jsonify([
        {
            "id": str(c.id),
            "title": c.title,
            "status": c.status
        }
        for c in courses
    ])
