from flask import Blueprint , jsonify , session, request, current_app
from flask_login import current_user, login_required
from app.models import CourseEnrollment, ExamAttempt, Lesson
from app.extensions import db
from app.utils.decorators import roles_required
from sqlalchemy import func

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
        course = enrollment.course
        # Calculate completion percentage based on lessons
        total_lessons = sum(len(ch.lessons) for ch in course.chapters) if course.chapters else 0
        completed_lessons = 0
        if total_lessons > 0:
            for chapter in course.chapters:
                for lesson in chapter.lessons:
                    if lesson.is_completed_by_student(student.id):
                        completed_lessons += 1
        
        progress = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
        
        courses_data.append({
            "id": str(course.id),
            "title": course.title,
            "progress": progress,
            "chapters": len(course.chapters) if course.chapters else 0
        })
    
    # Calculate consistency rate (based on exam attempts)
    consistency = min(int((len(attempts) or 0) * 5), 100) if attempts else 0
    
    # Get global rank (TODO: calculate from leaderboard position)
    global_rank = 24
    
    # Build upcoming exams/deadlines (next 5 unpassed exams or recent attempts)
    upcoming = []
    for attempt in sorted(attempts, key=lambda a: a.attempted_at, reverse=True)[:5]:
        exam = attempt.exam
        upcoming.append({
            "title": f"{exam.title}",
            "score": attempt.score,
            "attempted_at": attempt.attempted_at.strftime("%Y-%m-%d %H:%M")
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


