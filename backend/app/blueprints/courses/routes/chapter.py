# app/blueprints/course/chapter_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Course, Chapter
from app.extensions import db
from app.utils.decorators import roles_required

chapter_bp = Blueprint(
    "chapter",
    __name__,
    url_prefix="/api/teacher/courses/<uuid:course_id>/chapters"
)


@chapter_bp.route("", methods=["POST"])
@login_required
@roles_required("teacher")
def create_chapters(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    chapters = request.get_json()["chapters"]

    objects = []
    for i, ch in enumerate(chapters, start=1):
        objects.append(
            Chapter(
                course_id=course.id,
                title=ch["title"],
                description=ch.get("description"),
                order=ch.get("order", i),
                status=ch.get("status", "draft")
            )
        )

    db.session.bulk_save_objects(objects)
    db.session.commit()

    return jsonify({"created": len(objects)}), 201


@chapter_bp.route("", methods=["GET"])
@login_required
@roles_required("teacher")
def list_chapters(course_id):
    chapters = Chapter.query.filter_by(
        course_id=course_id
    ).order_by(Chapter.order).all()

    return jsonify([
        {
            "chapter_id": str(ch.id),
            "title": ch.title,
            "order": ch.order,
            "status": ch.status
        }
        for ch in chapters
    ])

@chapter_bp.route("/<uuid:chapter_id>", methods=["GET"])
@login_required
@roles_required("teacher")
def get_chapter(course_id, chapter_id):
    chapter = Chapter.query.filter_by(
        id=chapter_id,
        course_id=course_id
    ).first_or_404()

    return jsonify({
        "chapter_id": str(chapter.id),
        "title": chapter.title,
        "description": chapter.description,
        "order": chapter.order,
        "status": chapter.status
    }), 200


@chapter_bp.route("/<uuid:chapter_id>", methods=["PUT"])
@login_required
@roles_required("teacher")
def update_chapter(course_id, chapter_id):
    chapter = Chapter.query.filter_by(
        id=chapter_id,
        course_id=course_id
    ).first_or_404()

    data = request.get_json()

    chapter.title = data.get("title", chapter.title)
    chapter.description = data.get("description", chapter.description)
    chapter.order = data.get("order", chapter.order)
    chapter.status = data.get("status", chapter.status)

    db.session.commit()

    return jsonify({"message": "Chapter updated successfully"}), 200


@chapter_bp.route("/<uuid:chapter_id>", methods=["DELETE"])
@login_required
@roles_required("teacher")
def delete_chapter(course_id, chapter_id):
    chapter = Chapter.query.filter_by(
        id=chapter_id,
        course_id=course_id
    ).first_or_404()

    db.session.delete(chapter)
    db.session.commit()

    return jsonify({"message": "Chapter deleted successfully"}), 200