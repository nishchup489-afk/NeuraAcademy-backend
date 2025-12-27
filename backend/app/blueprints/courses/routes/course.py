# app/blueprints/course/course_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Course
from app.extensions import db
from app.utils.decorators import roles_required
from app.utils.cloudinary import upload_image

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
        thumbnail_url=data.get("thumbnail_url"),
        status="draft"
    )

    db.session.add(course)
    db.session.commit()

    return jsonify({
        "course_id": str(course.id)
    }), 201


@course_bp.route("/<uuid:course_id>", methods=["PUT", "PATCH"])
@login_required
@roles_required("teacher")
def update_course(course_id):
    data = request.get_json() or {}

    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    # Allow updating basic fields and thumbnail
    if 'title' in data:
        course.title = data.get('title')
    if 'description' in data:
        course.description = data.get('description')
    if 'price' in data:
        course.price = data.get('price')
    if 'currency' in data:
        course.currency = data.get('currency')
    if 'thumbnail_url' in data:
        course.thumbnail_url = data.get('thumbnail_url')

    db.session.commit()

    return jsonify({
        'message': 'Course updated',
        'course_id': str(course.id)
    }), 200


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


@course_bp.route("/<uuid:course_id>/archive", methods=["POST"])
@login_required
@roles_required("teacher")
def archive_course(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    course.status = "archived"
    db.session.commit()

    return jsonify({"message": "Course archived"}), 200


@course_bp.route("/<uuid:course_id>/thumbnail", methods=["POST"])
@login_required
@roles_required("teacher")
def upload_course_thumbnail(course_id):
    # Accept multipart/form-data with 'file'
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    public_id = f"course_{course.id}"
    url = upload_image(file, public_id=public_id, folder="course_thumbnails", width=1200, height=675)
    if not url:
        return jsonify({"error": "Upload failed"}), 500

    course.thumbnail_url = url
    db.session.commit()

    return jsonify({"thumbnail_url": url}), 200
