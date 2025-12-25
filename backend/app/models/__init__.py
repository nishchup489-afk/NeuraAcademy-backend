from .user import User
from .student import StudentProfile
from .teacher import TeacherProfile
from .parent import ParentProfile, ParentStudentLink
from .admin import AdminAccess
from .course import Course, CourseEnrollment, Lesson, Chapter, LessonComment, CourseRating, Exam, ExamQuestion, ExamAttempt
from .id_sequence import IDSequence

# Expose model classes for convenient imports
__all__ = [
    "User",
    "StudentProfile",
    "TeacherProfile",
    "ParentProfile",
    "ParentStudentLink",
    "AdminAccess",
    "Course",
    "CourseEnrollment",
    "Lesson",
    "Chapter",
    "LessonComment",
    "CourseRating",
    "Exam",
    "ExamQuestion",
    "ExamAttempt",
    "IDSequence"
]
