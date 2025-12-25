# app/blueprints/course/lesson_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Chapter, Lesson
from app.extensions import db
from app.utils.decorators import roles_required

lesson_bp = Blueprint(
    "lesson",
    __name__,
    url_prefix="/api/teacher/chapters/<uuid:chapter_id>/lessons"
)


@lesson_bp.route("", methods=["POST"])
@login_required
@roles_required("teacher")
def create_lesson(chapter_id):
    data = request.get_json()

    lesson = Lesson(
        chapter_id=chapter_id,
        title=data["title"],
        order=data["order"],
        content={},   # empty initially
        status="draft"
    )

    db.session.add(lesson)
    db.session.commit()

    return jsonify({"lesson_id": str(lesson.id)}), 201


@lesson_bp.route("", methods=["GET"])
@login_required
@roles_required("teacher")
def list_lessons(chapter_id):
    lessons = Lesson.query.filter_by(
        chapter_id=chapter_id
    ).order_by(Lesson.order).all()

    return jsonify([
        {
            "lesson_id": str(l.id),
            "title": l.title,
            "order": l.order,
            "status": l.status,
            "embed_url": l.embed_url
        }
        for l in lessons
    ]), 200


@lesson_bp.route("/<uuid:lesson_id>", methods=["GET"])
@login_required
@roles_required("teacher")
def get_lesson(chapter_id, lesson_id):
    lesson = Lesson.query.filter_by(
        id=lesson_id,
        chapter_id=chapter_id
    ).first_or_404()

    return jsonify({
        "lesson_id": str(lesson.id),
        "title": lesson.title,
        "order": lesson.order,
        "status": lesson.status,
        "embed_url": lesson.embed_url,
        "content": lesson.content
    }), 200


@lesson_bp.route("/<uuid:lesson_id>", methods=["PUT"])
@login_required
@roles_required("teacher")
def update_lesson(chapter_id, lesson_id):
    lesson = Lesson.query.filter_by(
        id=lesson_id,
        chapter_id=chapter_id
    ).first_or_404()

    data = request.get_json()

    lesson.title = data.get("title", lesson.title)
    lesson.order = data.get("order", lesson.order)
    lesson.status = data.get("status", lesson.status)
    lesson.embed_url = data.get("embed_url", lesson.embed_url)
    lesson.content = data.get("content", lesson.content)

    db.session.commit()

    return jsonify({"message": "Lesson updated successfully"}), 200


@lesson_bp.route("/<uuid:lesson_id>", methods=["DELETE"])
@login_required
@roles_required("teacher")
def delete_lesson(chapter_id, lesson_id):
    lesson = Lesson.query.filter_by(
        id=lesson_id,
        chapter_id=chapter_id
    ).first_or_404()

    db.session.delete(lesson)
    db.session.commit()

    return jsonify({"message": "Lesson deleted successfully"}), 200
