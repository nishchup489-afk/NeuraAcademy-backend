# app/blueprints/course/content_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required
from app.models import Lesson
from app.extensions import db
from app.utils.decorators import roles_required

content_bp = Blueprint(
    "lesson_content",
    __name__,
    url_prefix="/api/teacher/lessons/<uuid:lesson_id>/content"
)


@content_bp.route("", methods=["GET", "PATCH"])
@login_required
@roles_required("teacher")
def lesson_content(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)

    if request.method == "GET":
        return jsonify({
            "title": lesson.title,
            "embed_url": lesson.embed_url,
            "content": lesson.content
        })

    data = request.get_json()
    lesson.embed_url = data.get("embed_url", lesson.embed_url)
    lesson.content = data.get("content", lesson.content)

    db.session.commit()
    return jsonify({"message": "Updated"})
