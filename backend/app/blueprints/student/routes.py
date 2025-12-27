from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from app.models import (
    Course, CourseEnrollment, StudentProfile, CourseRating,
    Lesson, Chapter, Exam, ExamAttempt, ExamQuestion, LessonComment
)
from app.models import LessonCompletion
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
    
    # Get published courses
    courses = Course.query.filter_by(status="published").paginate(
        page=page, per_page=per_page
    )
    
    course_list = []
    for c in courses.items:
        # Build course list using actual model fields
        try:
            teacher_name = ""
            if getattr(c, "teacher", None):
                t = c.teacher
                user = getattr(t, "user", None)
                if user:
                    teacher_name = f"{getattr(user, 'first_name', '') or ''} {getattr(user, 'last_name', '') or ''}".strip()
                else:
                    teacher_name = getattr(t, "platform_name", None) or "Instructor"

            # compute average rating
            avg_rating = db.session.query(func.avg(CourseRating.rating)).filter_by(course_id=c.id).scalar() or 0
            review_count = db.session.query(func.count(CourseRating.id)).filter_by(course_id=c.id).scalar() or 0
            enrolled_count = db.session.query(func.count(CourseEnrollment.id)).filter_by(course_id=c.id).scalar() or 0

            chapter_count = 0
            try:
                chapter_count = c.chapters.count()
            except Exception:
                chapter_count = len(list(c.chapters)) if c.chapters else 0

            course_list.append({
                "id": str(c.id),
                "title": c.title,
                "description": c.description,
                "price": float(c.price) if c.price else 0,
                "thumbnail": getattr(c, "thumbnail_url", None) or None,
                "teacher_name": teacher_name,
                "rating": float(avg_rating or 0),
                "review_count": int(review_count),
                "enrolled_count": int(enrolled_count),
                "chapter_count": int(chapter_count),
                "created_at": c.created_at.isoformat() if c.created_at else None
            })
        except Exception as e:
            current_app.logger.error(f"Error processing course {getattr(c,'id', 'unknown')}: {e}")
            continue
    
    return jsonify({
        "courses": course_list,
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

    # compute avg rating
    avg_rating = db.session.query(func.avg(CourseRating.rating)).filter_by(course_id=course.id).scalar() or 0
    review_count = db.session.query(func.count(CourseRating.id)).filter_by(course_id=course.id).scalar() or 0
    enrolled_count = db.session.query(func.count(CourseEnrollment.id)).filter_by(course_id=course.id).scalar() or 0

    teacher_name = ""
    if getattr(course, "teacher", None):
        t = course.teacher
        user = getattr(t, "user", None)
        if user:
            teacher_name = f"{getattr(user, 'first_name', '') or ''} {getattr(user, 'last_name', '') or ''}".strip()
        else:
            teacher_name = getattr(t, "platform_name", None) or "Instructor"

    return jsonify({
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "price": float(course.price) if course.price else 0,
        "thumbnail": getattr(course, "thumbnail_url", None) or None,
        "teacher_name": teacher_name,
        "rating": float(avg_rating or 0),
        "review_count": int(review_count),
        "enrolled_count": int(enrolled_count),
        "requirements": getattr(course, "requirements", None),
        "level": getattr(course, "level", None),
        "duration": getattr(course, "duration", None),
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
    
    course = Course.query.filter_by(id=enrollment.course_id).first_or_404()
    
    chapters_data = []
    total_lessons = 0
    completed_lessons = 0
    
    for chapter in course.chapters:
        lessons_data = []
        for lesson in chapter.lessons:
            # Safely determine completion status (method may not exist)
            is_completed = False
            try:
                if hasattr(lesson, 'is_completed_by_student'):
                    is_completed = bool(lesson.is_completed_by_student(current_user.student_profile.id))
            except Exception:
                is_completed = False

            lessons_data.append({
                "id": str(lesson.id),
                "title": lesson.title,
                "order": lesson.order,
                "is_completed": is_completed
            })
            total_lessons += 1
            if is_completed:
                completed_lessons += 1
        
        chapters_data.append({
            "id": str(chapter.id),
            "title": chapter.title,
            "lessons": lessons_data
        })
    
    completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    
    teacher_name = ""
    if getattr(course, "teacher", None):
        t = course.teacher
        user = getattr(t, "user", None)
        if user:
            teacher_name = f"{getattr(user, 'first_name', '') or ''} {getattr(user, 'last_name', '') or ''}".strip()
        else:
            teacher_name = getattr(t, "platform_name", None) or "Instructor"

    return jsonify({
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "teacher_name": teacher_name,
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


# -----------------------
# Course Ratings / Reviews
# -----------------------
@student_bp.route("/courses/<uuid:course_id>/rating", methods=["POST"])
@login_required
@roles_required("student")
def submit_course_rating(course_id):
    course = Course.query.filter_by(id=course_id, status="published").first_or_404()

    # ensure student is enrolled before rating
    enrollment = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=course_id
    ).first_or_404()

    data = request.get_json() or {}
    rating = data.get("rating")
    review = data.get("review", None)

    try:
        rating = int(rating)
    except Exception:
        return jsonify({"error": "Invalid rating"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    existing = CourseRating.query.filter_by(course_id=course_id, student_id=current_user.student_profile.id).first()
    if existing:
        existing.rating = rating
        existing.review = review
    else:
        existing = CourseRating(
            course_id=course_id,
            student_id=current_user.student_profile.id,
            rating=rating,
            review=review
        )
        db.session.add(existing)

    db.session.commit()

    avg = db.session.query(func.avg(CourseRating.rating)).filter_by(course_id=course_id).scalar() or 0
    count = CourseRating.query.filter_by(course_id=course_id).count()

    return jsonify({
        "message": "Rating recorded",
        "average_rating": float(avg),
        "review_count": count
    }), 200


@student_bp.route("/courses/<uuid:course_id>/reviews", methods=["GET"])
@login_required
@roles_required("student")
def list_course_reviews(course_id):
    course = Course.query.filter_by(id=course_id, status="published").first_or_404()

    reviews = CourseRating.query.filter_by(course_id=course_id).filter(CourseRating.review != None).order_by(CourseRating.created_at.desc()).all()

    out = []
    for r in reviews:
        student = StudentProfile.query.get(r.student_id)
        name = f"{student.first_name} {student.last_name}" if student else "Student"
        out.append({
            "id": str(r.id),
            "student_id": str(r.student_id),
            "student_name": name,
            "rating": r.rating,
            "review": r.review,
            "created_at": r.created_at.isoformat()
        })

    return jsonify(out), 200


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


# -----------------------
# Lesson Comments
# -----------------------
@student_bp.route("/lessons/<uuid:lesson_id>/comments", methods=["GET"])
@login_required
@roles_required("student")
def list_lesson_comments(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)

    comments = LessonComment.query.filter_by(lesson_id=lesson.id).order_by(LessonComment.created_at.desc()).all()

    out = []
    for c in comments:
        student = None
        try:
            from app.models import StudentProfile
            student = StudentProfile.query.get(c.student_id)
        except Exception:
            student = None

        student_name = "Student"
        student_avatar = None
        if student:
            student_name = f"{student.first_name or ''} {student.last_name or ''}".strip() or "Student"
            student_avatar = getattr(student, 'avatar_url', None)

        out.append({
            "id": str(c.id),
            "student_id": str(c.student_id),
            "student_name": student_name,
            "avatar": student_avatar,
            "content": c.content,
            "created_at": c.created_at.isoformat()
        })

    return jsonify(out), 200


@student_bp.route("/lessons/<uuid:lesson_id>/comments", methods=["POST"])
@login_required
@roles_required("student")
def create_lesson_comment(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)

    # ensure student is enrolled in course
    enrollment = CourseEnrollment.query.filter_by(
        student_id=current_user.student_profile.id,
        course_id=lesson.chapter.course_id
    ).first_or_404()

    data = request.get_json() or {}
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"error": "Content required"}), 400

    comment = LessonComment(
        lesson_id=lesson.id,
        student_id=current_user.student_profile.id,
        content=content
    )

    db.session.add(comment)
    db.session.commit()

    # Include commenter info in response
    student = getattr(current_user, 'student_profile', None)
    student_name = "Student"
    student_avatar = None
    if student:
        student_name = f"{student.first_name or ''} {student.last_name or ''}".strip() or "Student"
        student_avatar = getattr(student, 'avatar_url', None)

    return jsonify({
        "id": str(comment.id),
        "lesson_id": str(comment.lesson_id),
        "student_id": str(comment.student_id),
        "student_name": student_name,
        "avatar": student_avatar,
        "content": comment.content,
        "created_at": comment.created_at.isoformat()
    }), 201


@student_bp.route("/lessons/comments/<uuid:comment_id>", methods=["DELETE"])
@login_required
@roles_required("student")
def delete_lesson_comment(comment_id):
    comment = LessonComment.query.filter_by(id=comment_id).first_or_404()

    if str(comment.student_id) != str(current_user.student_profile.id):
        return jsonify({"error": "Not authorized to delete this comment"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted"}), 200


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
            "question_count": e.questions.count() if e.questions else 0
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
    enrollments = CourseEnrollment.query.filter_by(student_id=student.id).all()
    attempts = ExamAttempt.query.filter_by(student_id=student.id).all()

    avg_score = db.session.query(func.avg(ExamAttempt.score)).filter_by(student_id=student.id).scalar() or 0

    # completed lessons count
    completed_count = LessonCompletion.query.filter_by(student_id=student.id).count()

    scores = [a.score for a in attempts if a.score is not None]

    return jsonify({
        "active_courses": len(enrollments),
        "avg_score": float(avg_score),
        "consistency_rate": 85,  # TODO: Improve calculation
        "global_rank": None,
        "completed_lessons": int(completed_count),
        "exams_taken": len(attempts),
        "certificates_earned": 0,
        "highest_score": float(max(scores, default=0)),
        "lowest_score": float(min(scores, default=0)),
        "pass_rate": float((len([a for a in attempts if a.score and a.score >= 60]) / len(attempts) * 100) if attempts else 0),
        "median_score": float(sorted(scores)[len(scores)//2] if scores else 0),
        "total_hours": 0
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
    
    courses_data = []
    for e in enrollments:
        # ensure we can access course via relationship or fallback
        course = getattr(e, 'course', None) or Course.query.filter_by(id=e.course_id).first()
        if not course:
            continue

        # compute completion percentage
        total_lessons = 0
        completed = 0
        for ch in course.chapters:
            for l in ch.lessons:
                total_lessons += 1
                if LessonCompletion.query.filter_by(lesson_id=l.id, student_id=student.id).first():
                    completed += 1

        completion_percentage = int((completed / total_lessons * 100) if total_lessons > 0 else 0)

        courses_data.append({
            "id": str(course.id),
            "title": course.title,
            "completion_percentage": completion_percentage,
            "average_score": 0,
            "hours_spent": 0,
            "is_completed": completion_percentage >= 100
        })
    
    return jsonify({"courses": courses_data}), 200


@student_bp.route("/profile", methods=["GET"])
@login_required
@roles_required("student")
def get_profile():
    """Get student profile"""
    student = current_user.student_profile
    
    if not student:
        return jsonify({"error": "Profile not found"}), 404
    
    return jsonify({
        "id": str(student.id),
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": current_user.email,
        "avatar": student.avatar_url,
        "bio": student.bio,
        "phone": student.phone,
        "country_code": student.country_code,
        "country": student.country,
        "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
        "github": student.github,
        "linkedin": student.linkedin,
        "x": student.x,
        "facebook": student.facebook,
        "instagram": student.instagram,
        "role_id": current_user.role_id
    }), 200
