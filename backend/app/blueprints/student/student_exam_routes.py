from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.extensions import db
from app.models import Exam, ExamAttempt, ExamQuestion
from datetime import datetime
import uuid

student_exam_bp = Blueprint(
    "student_exam",
    __name__,
    url_prefix="/api/student/exams"
)

# ---------------------------
# List available exams
# ---------------------------
@student_exam_bp.route("", methods=["GET"])
@login_required
def list_exams():
    exams = Exam.query.filter_by(status="published").all()

    from app.models import StudentProfile

    student_profile = StudentProfile.query.filter_by(user_id=current_user.id).first_or_404()

    attempts = ExamAttempt.query.filter_by(
        student_id=student_profile.id
    ).all()

    return jsonify({
        "exams": [
            {
                "id": str(e.id),
                "course_id": str(e.course_id),
                "title": e.title,
                "description": e.description,
                "time_limit": e.time_limit,
                "passing_score": e.passing_score,
                "total_questions": e.questions.count()
            }
            for e in exams
        ],
        "attempts": [
            {
                "id": str(a.id),
                "exam_id": str(a.exam_id),
                "score": a.score,
                "passed": a.passed,
                "started_at": a.start_time.isoformat()
            }
            for a in attempts
        ]
    })


# ---------------------------
# Get exam + auto create attempt
# ---------------------------
@student_exam_bp.route("/<uuid:exam_id>", methods=["GET"])
@login_required
def get_exam(exam_id):
    from app.models import StudentProfile

    student_profile = StudentProfile.query.filter_by(
        user_id=current_user.id
    ).first_or_404()

    exam = Exam.query.filter_by(
        id=exam_id,
        status="published"
    ).first_or_404()

    attempt = ExamAttempt.query.filter_by(
        exam_id=exam_id,
        student_id=student_profile.id
    ).first()

    if not attempt:
        attempt = ExamAttempt(
            id=uuid.uuid4(),
            exam_id=exam_id,
            student_id=student_profile.id,  # ✅ FIXED
            start_time=datetime.utcnow(),
            answers={}
        )
        db.session.add(attempt)
        db.session.commit()

    return jsonify({
        "attempt_id": str(attempt.id),
        "attempt_started_at": attempt.start_time.isoformat() if attempt.start_time else None,
        "attempt_end_time": attempt.end_time.isoformat() if attempt.end_time else None,
        "attempt_score": attempt.score,
        "attempt_submitted": bool(attempt.end_time),
        "id": str(exam.id),
        "title": exam.title,
        "description": exam.description,
        "time_limit": exam.time_limit,
        "questions": [
            {
                "id": str(q.id),
                "question_text": q.question_text,
                "type": q.question_type,
                "options": q.options,
                "points": q.points
            }
            for q in exam.questions.order_by(ExamQuestion.order)
        ]
    })



# ---------------------------
# Submit exam attempt
# ---------------------------
@student_exam_bp.route("/<uuid:exam_id>/attempt", methods=["POST"])
@login_required
def submit_exam(exam_id):
    from app.models import StudentProfile

    student_profile = StudentProfile.query.filter_by(
        user_id=current_user.id
    ).first_or_404()

    attempt = ExamAttempt.query.filter_by(
        exam_id=exam_id,
        student_id=student_profile.id
    ).first_or_404()

    if attempt.end_time:
        return jsonify({"error": "Exam already submitted"}), 403

    data = request.get_json() or {}
    answers = data.get("answers", {})

    exam = attempt.exam

    total_points = 0
    earned_points = 0

    for q in exam.questions:
        total_points += q.points
        student_answer = answers.get(str(q.id))

        if not student_answer:
            continue

        if q.question_type == "multiple_choice":
            if student_answer == q.correct_answer:
                earned_points += q.points

        elif q.question_type == "short_answer":
            if student_answer.strip().lower() == q.correct_answer.strip().lower():
                earned_points += q.points

    score_percent = (earned_points / total_points * 100) if total_points else 0
    passed = score_percent >= exam.passing_score

    attempt.answers = answers
    attempt.score = round(score_percent, 2)
    attempt.passed = passed
    attempt.end_time = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "attempt_id": str(attempt.id),
        "score": attempt.score,
        "passed": attempt.passed
    })



# ---------------------------
# Exam result
# ---------------------------
@student_exam_bp.route("/attempts/<uuid:attempt_id>/result", methods=["GET"])
@login_required
def exam_result(attempt_id):
    from app.models import StudentProfile

    student_profile = StudentProfile.query.filter_by(user_id=current_user.id).first_or_404()

    attempt = ExamAttempt.query.filter_by(
        id=attempt_id,
        student_id=student_profile.id
    ).first_or_404()

    return jsonify({
        "exam_id": str(attempt.exam_id),
        "score": attempt.score,
        "passed": attempt.passed,
        "started_at": attempt.start_time.isoformat(),
        "ended_at": attempt.end_time.isoformat() if attempt.end_time else None,
        "answers": attempt.answers
    })
