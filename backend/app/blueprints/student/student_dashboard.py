from flask import Blueprint , jsonify , session, request, current_app
from flask_login import current_user, login_required
from app.models import CourseEnrollment, ExamAttempt, Lesson, Course
from app.extensions import db
from app.utils.decorators import roles_required
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

student_bp = Blueprint("student" , __name__ , url_prefix="/api/student")

@student_bp.route('/dashboard' , methods=['GET'])
@login_required
@roles_required("student")
def Dashboard():
    # Debug: log incoming session and cookies to help diagnose 401
    current_app.logger.debug("[student.dashboard] session: %s", dict(session))
    current_app.logger.debug("[student.dashboard] request.cookies: %s", dict(request.cookies))
    current_app.logger.debug("[student.dashboard] current_user.is_authenticated: %s, current_user.id: %s, current_user.role: %s", getattr(current_user, 'is_authenticated', False), getattr(current_user, 'id', None), getattr(current_user, 'role', None))

    student = current_user.student_profile
    
    # Get active course enrollments
    enrollments = CourseEnrollment.query.filter_by(student_id=student.id).all()
    active_courses = len(enrollments)
    
    # Get exam attempts and calculate average score
    attempts = ExamAttempt.query.filter_by(student_id=student.id).all()
    avg_score = db.session.query(func.avg(ExamAttempt.score)).filter_by(
        student_id=student.id
    ).scalar() or 0
    
    # Build courses with progress
    courses_data = []
    for enrollment in enrollments:
        course = Course.query.filter_by(id=enrollment.course_id).first()
        if not course:
            current_app.logger.error(f"Enrollment {enrollment.id} references missing course {enrollment.course_id}")
            continue

        # Safely load chapters and lessons (relationships may be lazy='dynamic')
        if hasattr(course.chapters, 'all'):
            chapters = course.chapters.all()
        else:
            chapters = list(course.chapters) if course.chapters is not None else []

        total_lessons = 0
        completed_lessons = 0

        for chapter in chapters:
            if hasattr(chapter.lessons, 'count'):
                try:
                    lesson_count = chapter.lessons.count()
                except SQLAlchemyError:
                    db.session.rollback()  # Rollback the transaction
                    lesson_count = 0  # Default to 0 if error occurs
                lessons = []  # Skip loading lessons if count fails
            else:
                lessons = []  # Skip loading lessons if relationship is not valid
                lesson_count = 0

            total_lessons += lesson_count

            for lesson in lessons:
                try:
                    if lesson.is_completed_by_student(student.id):
                        completed_lessons += 1
                except Exception:
                    # If completion API isn't available, skip
                    pass

        progress = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0

        courses_data.append({
            "id": str(course.id),
            "title": course.title,
            "thumbnail_url": course.thumbnail_url,
            "progress": progress,
            "chapters": len(chapters)
        })
    
    # Calculate consistency rate (based on exam attempts)
    consistency = min(int((len(attempts) or 0) * 5), 100) if attempts else 0
    
    # Get global rank (calculate from avg score among all students)
    try:
        all_students_avg = db.session.query(
            func.avg(ExamAttempt.score).label('avg_score')
        ).group_by(ExamAttempt.student_id).all()
        
        current_avg = avg_score
        # Count how many students have higher avg score
        rank = 1
        for student_avg in all_students_avg:
            if student_avg[0] and student_avg[0] > current_avg:
                rank += 1
        global_rank = rank
    except Exception as e:
        current_app.logger.error(f"Error calculating global rank: {e}")
        global_rank = 1  # Default to 1 if error
    
    # Build upcoming exams/deadlines (next 5 unpassed exams or recent attempts)
    upcoming = []
    for attempt in sorted(attempts, key=lambda a: a.created_at, reverse=True)[:5]:
        exam = attempt.exam
        upcoming.append({
            "title": f"{exam.title}",
            "score": attempt.score,
            "attempted_at": attempt.created_at.strftime("%Y-%m-%d %H:%M")
        })
    
    data = {
        "active_courses": active_courses,
        "consistency": consistency,
        "avg_score": float(avg_score),
        "global_rank": global_rank,
        "courses": courses_data,
        "recent_exams": upcoming
    }

    return jsonify(data)


