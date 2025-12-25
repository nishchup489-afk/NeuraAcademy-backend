# app/blueprints/courses/exam_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import Course, Exam, ExamQuestion, ExamAttempt
from app.extensions import db
from app.utils.decorators import roles_required
from datetime import datetime, timedelta
from sqlalchemy import func

exam_bp = Blueprint(
    "exam",
    __name__,
    url_prefix="/api/teacher/courses/<uuid:course_id>/exams"
)


# ========================
# EXAM CRUD OPERATIONS
# ========================

@exam_bp.route("", methods=["POST"])
@login_required
@roles_required("teacher")
def create_exam(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    data = request.get_json()

    exam = Exam(
        course_id=course.id,
        teacher_id=current_user.teacher_profile.id,
        title=data.get("title", ""),
        description=data.get("description", ""),
        time_limit=data.get("time_limit", 60),
        passing_score=data.get("passing_score", 60.0),
        total_points=data.get("total_points", 100.0),
        status="draft"
    )

    db.session.add(exam)
    db.session.commit()

    return jsonify({
        "exam_id": str(exam.id),
        "message": "Exam created successfully"
    }), 201


@exam_bp.route("", methods=["GET"])
@login_required
@roles_required("teacher")
def list_exams(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    exams = Exam.query.filter_by(course_id=course.id).all()

    return jsonify([
        {
            "id": str(exam.id),
            "title": exam.title,
            "description": exam.description,
            "time_limit": exam.time_limit,
            "passing_score": exam.passing_score,
            "total_points": exam.total_points,
            "status": exam.status,
            "question_count": exam.questions.count(),
            "created_at": exam.created_at.isoformat()
        }
        for exam in exams
    ]), 200


@exam_bp.route("/<uuid:exam_id>", methods=["GET"])
@login_required
@roles_required("teacher")
def get_exam(course_id, exam_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    questions = ExamQuestion.query.filter_by(exam_id=exam.id).order_by(ExamQuestion.order).all()

    return jsonify({
        "id": str(exam.id),
        "title": exam.title,
        "description": exam.description,
        "time_limit": exam.time_limit,
        "passing_score": exam.passing_score,
        "total_points": exam.total_points,
        "status": exam.status,
        "questions": [
            {
                "id": str(q.id),
                "question_text": q.question_text,
                "type": q.question_type,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "points": q.points,
                "order": q.order
            }
            for q in questions
        ]
    }), 200


@exam_bp.route("/<uuid:exam_id>", methods=["PUT"])
@login_required
@roles_required("teacher")
def update_exam(course_id, exam_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    data = request.get_json()

    exam.title = data.get("title", exam.title)
    exam.description = data.get("description", exam.description)
    exam.time_limit = data.get("time_limit", exam.time_limit)
    exam.passing_score = data.get("passing_score", exam.passing_score)
    exam.total_points = data.get("total_points", exam.total_points)

    db.session.commit()

    return jsonify({"message": "Exam updated successfully"}), 200


@exam_bp.route("/<uuid:exam_id>", methods=["DELETE"])
@login_required
@roles_required("teacher")
def delete_exam(course_id, exam_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    db.session.delete(exam)
    db.session.commit()

    return jsonify({"message": "Exam deleted successfully"}), 200


# ========================
# EXAM QUESTIONS
# ========================

@exam_bp.route("/<uuid:exam_id>/questions", methods=["POST"])
@login_required
@roles_required("teacher")
def add_question(course_id, exam_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    data = request.get_json()

    # Get the next order number
    last_question = ExamQuestion.query.filter_by(exam_id=exam.id).order_by(ExamQuestion.order.desc()).first()
    order = (last_question.order + 1) if last_question else 1

    question = ExamQuestion(
        exam_id=exam.id,
        question_text=data.get("question_text", ""),
        question_type=data.get("question_type", "multiple_choice"),
        options=data.get("options", {}),
        correct_answer=data.get("correct_answer", ""),
        points=data.get("points", 10.0),
        order=order
    )

    db.session.add(question)
    db.session.commit()

    return jsonify({
        "question_id": str(question.id),
        "message": "Question added successfully"
    }), 201


@exam_bp.route("/<uuid:exam_id>/questions/<uuid:question_id>", methods=["PUT"])
@login_required
@roles_required("teacher")
def update_question(course_id, exam_id, question_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    question = ExamQuestion.query.filter_by(
        id=question_id,
        exam_id=exam.id
    ).first_or_404()

    data = request.get_json()

    question.question_text = data.get("question_text", question.question_text)
    question.question_type = data.get("question_type", question.question_type)
    question.options = data.get("options", question.options)
    question.correct_answer = data.get("correct_answer", question.correct_answer)
    question.points = data.get("points", question.points)

    db.session.commit()

    return jsonify({"message": "Question updated successfully"}), 200


@exam_bp.route("/<uuid:exam_id>/questions/<uuid:question_id>", methods=["DELETE"])
@login_required
@roles_required("teacher")
def delete_question(course_id, exam_id, question_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    question = ExamQuestion.query.filter_by(
        id=question_id,
        exam_id=exam.id
    ).first_or_404()

    db.session.delete(question)
    db.session.commit()

    return jsonify({"message": "Question deleted successfully"}), 200


# ========================
# PUBLISH EXAM
# ========================

@exam_bp.route("/<uuid:exam_id>/publish", methods=["POST"])
@login_required
@roles_required("teacher")
def publish_exam(course_id, exam_id):
    exam = Exam.query.filter_by(
        id=exam_id,
        course_id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    if exam.questions.count() == 0:
        return jsonify({"error": "Cannot publish exam without questions"}), 400

    exam.status = "published"
    db.session.commit()

    return jsonify({"message": "Exam published successfully"}), 200
