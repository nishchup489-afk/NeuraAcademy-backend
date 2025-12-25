from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.utils.decorators import roles_required
from app.models import Course, Chapter, Lesson
from app.extensions import db
from app.schema import CreateChaptersSchema, LessonSchema
from marshmallow import ValidationError
from app.utils.cloudinary import upload_profile

chaterschema = CreateChaptersSchema()
lessonschema = LessonSchema()

course_bp = Blueprint("course", __name__, url_prefix="/api")


@course_bp.route("/teacher/courses")
@login_required
@roles_required("teacher")
def list_teacher_course():
    courses = Course.query.filter_by(
        teacher_id=current_user.teacher_profile.id
    ).order_by(Course.created_at.desc()).all()

    return jsonify(
        [
            {
                "id": str(c.id),
                "title": c.title,
                "status": c.status,
                "created_at": c.created_at.isoformat()
            }
            for c in courses
        ]
    )


@course_bp.route("/teacher/courses", methods=["POST"])
@login_required
@roles_required("teacher")
def create_course():
    data = request.get_json()

    if not data or "title" not in data:
        return jsonify({"error": "Title required"}), 400

    course = Course(
        title=data["title"],
        description=data.get("description", ""),
        price=data.get("price", 0),
        currency=data.get("currency", "USD"),
        status=data.get("status", "draft"),
        teacher_id=current_user.teacher_profile.id
    )

    db.session.add(course)
    db.session.commit()

    return jsonify({
        "message": "Course created",
        "course_id": str(course.id)
    }), 201


@course_bp.route("/teacher/courses/<uuid:course_id>/thumbnail", methods=["POST"])
@login_required
@roles_required("teacher")
def upload_course_thumbnail(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    if "file" not in request.files:
        course.thumbnail_url = "https://res.cloudinary.com/dojqet1dg/image/upload/v1766539534/lucid-origin_A_modern_and_minimalistic_course_thumbnail_16_9_ratio_soft_gradient_background_b-0_t5s7my.jpg"
        db.session.commit()
        return jsonify({
            "message": "No file uploaded, default thumbnail assigned",
            "thumbnail_url": course.thumbnail_url
        }), 200

    file = request.files["file"]
    url = upload_profile(
        file,
        public_id=f"course_{course_id}"
    )

    course.thumbnail_url = url
    db.session.commit()

    return jsonify({
        "message": "Thumbnail uploaded",
        "thumbnail_url": url
    }), 200


@course_bp.route("/teacher/courses/create/<uuid:course_id>/create_chapters", methods=["POST", "GET"])
@login_required
@roles_required("teacher")
def create_chapters(course_id):
    try:
        data = chaterschema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    chapters_data = data["chapters"]

    chapters = []
    for index, ch in enumerate(chapters_data, start=1):
        chapters.append(
            Chapter(
                course_id=course_id,
                title=ch["title"],
                description=ch["description"],
                order=ch.get("order", index),
                status=ch.get("status", "draft")
            )
        )

    db.session.bulk_save_objects(chapters)
    db.session.commit()

    chapter_ids = [c.id for c in chapters]

    return jsonify({
        "message": "Course chapters added successfully",
        "chapters_created": len(chapters),
        "chapter_id": chapter_ids
    }), 201


@course_bp.route("/teacher/courses/create/<uuid:course_id>/chapters" , methods= ["GET"])
@login_required
@roles_required("teacher")
def show_created_course(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    chapters = Chapter.query.filter_by(
        course_id=course.id
    ).first_or_404()

    response = []
    for chapter in chapters:
        lessons = Lesson.query.filter_by(
            chapter_id=chapter.id
        ).order_by(Lesson.order.asc()).all()

        response.append({
            "chapter_id": str(chapter.id),
            "title": chapter.title,
            "description": chapter.description,
            "order": chapter.order,
            "status": chapter.status,
            "lessons": [
                {
                    "lesson_id": str(lesson.id),
                    "title": lesson.title,
                    "order": lesson.order,
                    "status": lesson.status
                }
                for lesson in lessons
            ]
        })

    return jsonify({
        "course_id": str(course.id),
        "course_title": course.title,
        "chapters": response , 
        "description" : response.description , 
        "order" : response.order ,
        "status" : response.status
    }), 200






@course_bp.route("/teacher/courses/create/<uuid:course_id>/create_lessons/<uuid:chapter_id>/lessons", methods=["POST"])
@login_required
@roles_required("teacher")
def create_lessons(course_id, chapter_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    chapter = Chapter.query.filter_by(
        id=chapter_id,
        course_id=course.id
    ).first_or_404()

    try:
        data = lessonschema.load(request.get_json())
    except ValidationError as e:
        return jsonify(e.messages), 400

    lesson = Lesson(
        chapter_id=chapter.id,
        title=data["title"],
        order=data["order"],
        status=data.get("status", "draft"),
        content={}  # initialize empty content
    )

    db.session.add(lesson)
    db.session.commit()

    return jsonify({
        "message": "Lesson created successfully",
        "lesson_id": str(lesson.id)
    }), 201


# ------------------------
# Lesson content creation route
# ------------------------
@course_bp.route("/teacher/courses/create/<uuid:course_id>/create_lessons/<uuid:chapter_id>/lessons/<uuid:lessonID>/content_create", methods=["GET", "PATCH"])
@login_required
@roles_required("teacher")
def create_lessons_content(course_id, chapter_id, lessonID):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    chapter = Chapter.query.filter_by(
        id=chapter_id,
        course_id=course.id
    ).first_or_404()

    lesson = Lesson.query.filter_by(
        id=lessonID,
        chapter_id=chapter.id
    ).first_or_404()

    if request.method == "GET":
        return jsonify({
            "title": lesson.title,
            "embed_url": lesson.embed_url,
            "content": lesson.content
        })

    if request.method == "PATCH":
        data = request.get_json()
        lesson.embed_url = data.get("embed_url", lesson.embed_url)
        lesson.content = data.get("content", lesson.content)
        db.session.commit()
        return jsonify({
            "message": "Lesson content updated successfully"
        })
