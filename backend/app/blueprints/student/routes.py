from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import (
    Course, CourseEnrollment, StudentProfile, CourseRating,
    Lesson, Chapter, Exam, ExamAttempt, ExamQuestion
)
from app.extensions import db
from app.utils.decorators import roles_required
from sqlalchemy import func, desc
import json

student_bp = Blueprint("student_api", __name__, url_prefix="/api/student")


# ========================
# COURSE LISTING & DETAILS
# ========================

@student_bp.route("/courses/available", methods=["GET"])
@login_required
@roles_required("student")
def get_available_courses():
    """Get all available courses for enrollment"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    
    courses = Course.query.filter_by(status="published").paginate(
        page=page, per_page=per_page
    )
    
    return jsonify({
        "courses": [
            {
                "id": str(c.id),
                "title": c.title,
                "description": c.description,
                "price": float(c.price),
                "thumbnail": c.thumbnail,
                "teacher_name": c.teacher_profile.first_name + " " + c.teacher_profile.last_name,
                "rating": float(c.average_rating or 0),
                "review_count": db.session.query(func.count(CourseRating.id)).filter_by(
                    course_id=c.id
                ).scalar() or 0,
                "enrolled_count": db.session.query(func.count(CourseEnrollment.id)).filter_by(
                    course_id=c.id
                ).scalar() or 0,
                "chapter_count": len(c.chapters) if c.chapters else 0,
                "created_at": c.created_at.isoformat()
            }
            for c in courses.items
        ],
        "total": courses.total,
        "pages": courses.pages,
        "current_page": page
    }), 200


@student_bp.route("/courses/<uuid:course_id>", methods=["GET"])
@login_required
@roles_required("student")
def get_course_detail(course_id):
    """Get course details with chapters and lessons"""
    course = Course.query.filter_by(id=course_id, status="published").first_or_404()
    
    enrollment = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=course_id
    ).first()
    
    chapters_data = []
    for chapter in course.chapters:
        lessons_data = [
            {
                "id": str(l.id),
                "title": l.title,
                "order": l.order,
                "is_completed": False  # TODO: Check completion status
            }
            for l in chapter.lessons
        ]
        chapters_data.append({
            "id": str(chapter.id),
            "title": chapter.title,
            "lessons": lessons_data
        })
    
    return jsonify({
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "price": float(course.price),
        "thumbnail": course.thumbnail,
        "teacher_name": course.teacher_profile.first_name + " " + course.teacher_profile.last_name,
        "rating": float(course.average_rating or 0),
        "review_count": db.session.query(func.count(CourseRating.id)).filter_by(
            course_id=course.id
        ).scalar() or 0,
        "enrolled_count": db.session.query(func.count(CourseEnrollment.id)).filter_by(
            course_id=course.id
        ).scalar() or 0,
        "requirements": course.requirements,
        "level": course.level,
        "duration": course.duration,
        "is_enrolled": bool(enrollment),
        "chapters": chapters_data
    }), 200


@student_bp.route("/courses/<uuid:course_id>/learn", methods=["GET"])
@login_required
@roles_required("student")
def get_course_for_learning(course_id):
    """Get course for learning (student enrolled check)"""
    enrollment = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=course_id
    ).first_or_404()
    
    course = enrollment.course
    
    chapters_data = []
    total_lessons = 0
    completed_lessons = 0
    
    for chapter in course.chapters:
        lessons_data = []
        for lesson in chapter.lessons:
            lessons_data.append({
                "id": str(lesson.id),
                "title": lesson.title,
                "order": lesson.order,
                "is_completed": lesson.is_completed_by_student(current_user.student_profile.id)
            })
            total_lessons += 1
            if lesson.is_completed_by_student(current_user.student_profile.id):
                completed_lessons += 1
        
        chapters_data.append({
            "id": str(chapter.id),
            "title": chapter.title,
            "lessons": lessons_data
        })
    
    completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    
    return jsonify({
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "teacher_name": course.teacher_profile.first_name + " " + course.teacher_profile.last_name,
        "completion_percentage": int(completion_percentage),
        "chapters": chapters_data
    }), 200


# ========================
# ENROLLMENT
# ========================

@student_bp.route("/courses/<uuid:course_id>/enroll", methods=["POST"])
@login_required
@roles_required("student")
def enroll_course(course_id):
    """Enroll student in a course"""
    course = Course.query.filter_by(id=course_id, status="published").first_or_404()
    
    existing = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=course_id
    ).first()
    
    if existing:
        return jsonify({"error": "Already enrolled"}), 400
    
    enrollment = CourseEnrollment(
        student_id=current_user.student_profile.id,
        course_id=course_id
    )
    
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({"message": "Enrolled successfully"}), 201


# ========================
# LESSONS
# ========================

@student_bp.route("/lessons/<uuid:lesson_id>/content", methods=["GET"])
@login_required
@roles_required("student")
def get_lesson_content(lesson_id):
    """Get lesson content"""
    lesson = Lesson.query.get_or_404(lesson_id)
    
    # Check if student is enrolled in the course
    enrollment = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=lesson.chapter.course_id
    ).first_or_404()
    
    return jsonify({
        "title": lesson.title,
        "embed_url": lesson.embed_url,
        "content": lesson.content
    }), 200


@student_bp.route("/lessons/<uuid:lesson_id>/complete", methods=["POST"])
@login_required
@roles_required("student")
def mark_lesson_complete(lesson_id):
    """Mark lesson as completed"""
    lesson = Lesson.query.get_or_404(lesson_id)
    student = current_user.student_profile
    
    # Mark as completed (implement in Lesson model)
    lesson.mark_completed(student.id)
    db.session.commit()
    
    return jsonify({"message": "Lesson marked as complete"}), 200


# ========================
# EXAMS
# ========================

@student_bp.route("/courses/<uuid:course_id>/exams", methods=["GET"])
@login_required
@roles_required("student")
def get_course_exams(course_id):
    """Get exams for a course"""
    enrollment = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=course_id
    ).first_or_404()
    
    exams = Exam.query.filter_by(course_id=course_id, status="published").all()
    attempts = ExamAttempt.query.filter_by(
        student_id=current_user.student_profile.id
    ).all()
    
    exams_data = [
        {
            "id": str(e.id),
            "title": e.title,
            "description": e.description,
            "time_limit": e.time_limit,
            "passing_score": e.passing_score,
            "total_points": e.total_points,
            "question_count": len(e.questions) if e.questions else 0
        }
        for e in exams
    ]
    
    attempts_data = [
        {
            "id": str(a.id),
            "exam_id": str(a.exam_id),
            "score": a.score,
            "attempted_at": a.attempted_at.isoformat()
        }
        for a in attempts
    ]
    
    return jsonify({
        "exams": exams_data,
        "attempts": attempts_data
    }), 200


# ========================
# FRIENDS
# ========================

@student_bp.route("/friends", methods=["GET"])
@login_required
@roles_required("student")
def get_friends():
    """Get student's friends"""
    # Friends feature not yet implemented in models.
    # Return a 501 to indicate the functionality is pending.
    return jsonify({"error": "Friends feature not implemented on server"}), 501


@student_bp.route("/friends", methods=["POST"])
@login_required
@roles_required("student")
def add_friend():
    """Add a friend by role_id"""
    data = request.get_json()
    friend_id = data.get("friend_id")
    
    return jsonify({"error": "Friends feature not implemented on server"}), 501


@student_bp.route("/friends/<uuid:friend_id>", methods=["DELETE"])
@login_required
@roles_required("student")
def remove_friend(friend_id):
    """Remove a friend"""
    return jsonify({"error": "Friends feature not implemented on server"}), 501


# ========================
# LEADERBOARD
# ========================

@student_bp.route("/leaderboard", methods=["GET"])
@login_required
@roles_required("student")
def get_leaderboard():
    """Get global leaderboard"""
    # Top students by average score and points
    students = db.session.query(
        StudentProfile,
        func.avg(ExamAttempt.score).label("avg_score"),
        func.count(CourseEnrollment.id).label("course_count"),
        func.count(ExamAttempt.id).label("exam_count")
    ).join(CourseEnrollment).join(ExamAttempt, isouter=True).group_by(
        StudentProfile.id
    ).order_by(
        desc(func.avg(ExamAttempt.score))
    ).limit(100).all()
    
    leaderboard_data = [
        {
            "id": str(s[0].id),
            "name": s[0].first_name + " " + s[0].last_name,
            "role_id": s[0].user.role_id,
            "avatar": s[0].avatar,
            "enrolled_courses": int(s[2] or 0),
            "average_score": float(s[1] or 0),
            # Use exam_count (s[3]) as a simple proxy for activity
            "consistency_rate": min(int((s[3] or 0) * 5), 100),
            "points": int((s[1] or 0) * 10)
        }
        for s in students
    ]
    
    return jsonify({"leaderboard": leaderboard_data}), 200


# ========================
# ANALYTICS
# ========================

@student_bp.route("/analytics", methods=["GET"])
@login_required
@roles_required("student")
def get_analytics():
    """Get student analytics"""
    student = current_user.student_profile
    
    enrollments = CourseEnrollment.query.filter_by(
        student_id=student.id
    ).all()
    
    attempts = ExamAttempt.query.filter_by(
        student_id=student.id
    ).all()
    
    avg_score = db.session.query(func.avg(ExamAttempt.score)).filter_by(
        student_id=student.id
    ).scalar() or 0
    
    return jsonify({
        "active_courses": len(enrollments),
        "average_score": float(avg_score),
        "consistency_rate": 85,  # TODO: Calculate based on learning patterns
        "global_rank": 24,  # TODO: Calculate from leaderboard
        "completed_lessons": 0,  # TODO: Count completed lessons
        "exams_taken": len(attempts),
        "certificates_earned": 0,  # TODO: Count certificates
        "highest_score": float(max([a.score for a in attempts], default=0)),
        "lowest_score": float(min([a.score for a in attempts], default=0)),
        "pass_rate": float((len([a for a in attempts if a.score >= 60]) / len(attempts) * 100) if attempts else 0),
        "median_score": float(sorted([a.score for a in attempts])[len(attempts)//2] if attempts else 0),
        "total_hours": 0  # TODO: Calculate from lesson tracking
    }), 200


@student_bp.route("/analytics/courses", methods=["GET"])
@login_required
@roles_required("student")
def get_courses_analytics():
    """Get analytics for each course"""
    student = current_user.student_profile
    enrollments = CourseEnrollment.query.filter_by(
        student_id=student.id
    ).all()
    
    courses_data = [
        {
            "id": str(e.course.id),
            "title": e.course.title,
            "completion_percentage": 0,  # TODO: Calculate from lessons
            "average_score": 0,  # TODO: Calculate from exams in this course
            "hours_spent": 0,  # TODO: Track time
            "is_completed": False
        }
        for e in enrollments
    ]
    
    return jsonify({"courses": courses_data}), 200


@student_bp.route("/profile", methods=["GET"])
@login_required
@roles_required("student")
def get_profile():
    """Get student profile"""
    student = current_user.student_profile
    
    return jsonify({
        "id": str(student.id),
        "name": student.first_name + " " + student.last_name,
        "avatar": student.avatar,
        "bio": student.bio,
        "role_id": current_user.role_id
    }), 200
