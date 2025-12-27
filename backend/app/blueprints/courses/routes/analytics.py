# app/blueprints/courses/analytics.py

from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import Course, CourseEnrollment, CourseRating, ExamAttempt, Exam
from app.extensions import db
from app.utils.decorators import roles_required
from sqlalchemy import func

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/teacher/analytics"
)


@analytics_bp.route("/courses/<uuid:course_id>", methods=["GET"])
@login_required
@roles_required("teacher")
def get_course_analytics(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    # Student enrollment count
    total_enrollments = CourseEnrollment.query.filter_by(course_id=course.id).count()

    # Average course rating
    ratings = db.session.query(func.avg(CourseRating.rating)).filter_by(course_id=course.id).scalar()
    average_rating = float(ratings) if ratings else 0.0

    # Total ratings count
    total_ratings = CourseRating.query.filter_by(course_id=course.id).count()

    # Get all exams for this course
    exams = Exam.query.filter_by(course_id=course.id).all()

    exam_performance = []
    for exam in exams:
        attempts = ExamAttempt.query.filter_by(exam_id=exam.id).all()
        if attempts:
            avg_score = sum(a.score for a in attempts if a.score is not None) / len([a for a in attempts if a.score is not None])
            passed_count = len([a for a in attempts if a.passed])
            exam_performance.append({
                "exam_id": str(exam.id),
                "exam_title": exam.title,
                "total_attempts": len(attempts),
                "average_score": round(avg_score, 2),
                "passed_count": passed_count,
                "pass_rate": round((passed_count / len(attempts)) * 100, 2) if attempts else 0
            })

    # Student engagement (average progress)
    enrollments = CourseEnrollment.query.filter_by(course_id=course.id).all()
    avg_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0

    return jsonify({
        "course_id": str(course.id),
        "course_title": course.title,
        "thumbnail_url": course.thumbnail_url,
        "total_enrollments": total_enrollments,
        "completed_enrollments": len([e for e in enrollments if e.completed]),
        "average_rating": round(average_rating, 2),
        "total_ratings": total_ratings,
        "average_progress": round(avg_progress, 2),
        "exam_performance": exam_performance
    }), 200


@analytics_bp.route("/teacher/dashboard", methods=["GET"])
@login_required
@roles_required("teacher")
def get_teacher_dashboard():
    teacher_id = current_user.teacher_profile.id

    # Get all courses for teacher
    courses = Course.query.filter_by(teacher_id=teacher_id).all()

    total_students = 0
    total_revenue = 0.0
    course_summaries = []

    for course in courses:
        enrollments = CourseEnrollment.query.filter_by(course_id=course.id).count()
        total_students += enrollments

        # Calculate revenue (if price is set)
        if course.price:
            course_revenue = float(course.price) * enrollments
            total_revenue += course_revenue

        # Get ratings
        ratings = db.session.query(func.avg(CourseRating.rating)).filter_by(course_id=course.id).scalar()
        avg_rating = float(ratings) if ratings else 0.0

        course_summaries.append({
            "id": str(course.id),
            "title": course.title,
            "thumbnail_url": course.thumbnail_url,
            "status": course.status,
            "enrollments": enrollments,
            "average_rating": round(avg_rating, 2),
            "revenue": round(float(course.price) * enrollments, 2) if course.price else 0
        })

    return jsonify({
        "total_courses": len(courses),
        "total_students": total_students,
        "total_revenue": round(total_revenue, 2),
        "courses": course_summaries
    }), 200


@analytics_bp.route("/courses/<uuid:course_id>/students", methods=["GET"])
@login_required
@roles_required("teacher")
def get_course_students(course_id):
    course = Course.query.filter_by(
        id=course_id,
        teacher_id=current_user.teacher_profile.id
    ).first_or_404()

    enrollments = CourseEnrollment.query.filter_by(course_id=course.id).all()

    students_data = []
    for enrollment in enrollments:
        student = enrollment.student_id  # This would need the relationship
        
        # Get student's exam attempts
        exam_attempts = ExamAttempt.query.filter_by(student_id=enrollment.student_id).all()
        exams_completed = len([a for a in exam_attempts if a.end_time is not None])

        students_data.append({
            "student_id": str(enrollment.student_id),
            "enrolled_at": enrollment.enrolled_at.isoformat(),
            "progress": enrollment.progress_percent,
            "completed": enrollment.completed,
            "exams_completed": exams_completed
        })

    return jsonify({
        "course_id": str(course.id),
        "total_students": len(students_data),
        "students": students_data
    }), 200
