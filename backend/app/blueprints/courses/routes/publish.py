# app/blueprints/course/publish_routes.py

from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import Course
from app.extensions import db
from app.utils.decorators import roles_required

publish_bp = Blueprint(
    "publish",
    __name__,
    url_prefix="/api/teacher/courses/<uuid:course_id>"
)


@publish_bp.route("/publish", methods=["POST"])
@login_required
@roles_required("teacher")
def publish_course(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    if course.chapters.count() == 0:
        return jsonify({"error": "No chapters"}), 400

    course.status = "published"
    db.session.commit()

    return jsonify({"message": "Course published"})
