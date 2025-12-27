from app.extensions import db
import uuid
from sqlalchemy.dialects.postgresql import UUID , JSONB



# ------------------------
# Courses
# ------------------------
class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey("teacher_profiles.id"), nullable=False)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    price = db.Column(db.Numeric)
    currency = db.Column(db.String(10))
    thumbnail_url = db.Column(db.Text , nullable=True)
    status = db.Column(db.Enum("draft","published","archived", name="course_status"), default="draft")
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    teacher = db.relationship("TeacherProfile", backref=db.backref("courses", lazy="dynamic"))


# ------------------------
# Enrollments
# ------------------------
class CourseEnrollment(db.Model):
    __tablename__ = "course_enrollments"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id"), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey("courses.id"), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=db.func.now())
    progress_percent = db.Column(db.Float, default=0.0)
    completed = db.Column(db.Boolean, default=False)

    # Indexes for fast lookups
    __table_args__ = (
        db.Index('idx_course_enrollments_course_id', 'course_id'),
        db.Index('idx_course_enrollments_student_id', 'student_id'),
    )
    # Relationship to Course for convenience
    course = db.relationship("Course", backref=db.backref("enrollments", lazy="dynamic"))


# ------------------------
# Ratings
# ------------------------
class CourseRating(db.Model):
    __tablename__ = "course_ratings"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey("courses.id"), nullable=False)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id"), nullable=False)

    rating = db.Column(db.Integer, nullable=False)  # 1–5
    review = db.Column(db.Text)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint("course_id", "student_id", name="uq_course_student_rating"),
        db.Index('idx_course_ratings_course_id', 'course_id'),
    )


# ------------------------
# Chapters
# ------------------------
class Chapter(db.Model):
    __tablename__ = "course_chapters"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey("courses.id"), nullable=False)

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, nullable=False)

    status = db.Column(db.Enum("draft","published","archived", name="content_status"), default="draft")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    course = db.relationship("Course", backref=db.backref("chapters", lazy="dynamic"))


# ------------------------
# Lessons
# ------------------------
class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = db.Column(UUID(as_uuid=True), db.ForeignKey("course_chapters.id"), nullable=False)

    title = db.Column(db.String(200), nullable=False)
    order = db.Column(db.Integer, nullable=False)

    embed_url = db.Column(db.String(300) , nullable=True)

    content = db.Column(JSONB , nullable=False)  # Tiptap JSON
    status = db.Column(db.Enum("draft","published","archived", name="lesson_status"), default="draft")

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    chapter = db.relationship("Chapter", backref=db.backref("lessons", lazy="dynamic"))

    def is_completed_by_student(self, student_id):
        """Return True if the student has a completion record for this lesson."""
        from app.extensions import db
        # Import here to avoid circular imports at module load
        rc = LessonCompletion.query.filter_by(lesson_id=self.id, student_id=student_id).first()
        return bool(rc)

    def mark_completed(self, student_id):
        """Create a completion record for the student if it doesn't exist and update enrollment progress."""
        existing = LessonCompletion.query.filter_by(lesson_id=self.id, student_id=student_id).first()
        if existing:
            return existing

        lc = LessonCompletion(lesson_id=self.id, student_id=student_id)
        db.session.add(lc)

        # Update course enrollment progress
        course_id = self.chapter.course_id
        enrollment = CourseEnrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
        if enrollment:
            # recompute completed lessons for course
            total_lessons = 0
            completed = 0
            for ch in Course.query.get(course_id).chapters:
                for l in ch.lessons:
                    total_lessons += 1
                    if LessonCompletion.query.filter_by(lesson_id=l.id, student_id=student_id).first():
                        completed += 1

            enrollment.progress_percent = (completed / total_lessons * 100) if total_lessons > 0 else 0
            enrollment.completed = enrollment.progress_percent >= 100

        return lc


# ------------------------
# Lesson Comments
# ------------------------
class LessonComment(db.Model):
    __tablename__ = "lesson_comments"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = db.Column(UUID(as_uuid=True), db.ForeignKey("lessons.id"), nullable=False)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id"), nullable=False)
    
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    lesson = db.relationship("Lesson", backref=db.backref("comments", lazy="dynamic"))

    # Index for performance
    __table_args__ = (
        db.Index('idx_lesson_comments_lesson_id', 'lesson_id'),
    )


# ------------------------
# Lesson Completion
# ------------------------
class LessonCompletion(db.Model):
    __tablename__ = "lesson_completions"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = db.Column(UUID(as_uuid=True), db.ForeignKey("lessons.id"), nullable=False)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id"), nullable=False)
    completed_at = db.Column(db.DateTime, server_default=db.func.now())

    lesson = db.relationship("Lesson", backref=db.backref("completions", lazy="dynamic"))

    __table_args__ = (
        db.Index('idx_lesson_completions_lesson_id', 'lesson_id'),
        db.Index('idx_lesson_completions_student_id', 'student_id'),
    )

# ------------------------
# Exams
# ------------------------
class Exam(db.Model):
    __tablename__ = "exams"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey("courses.id"), nullable=False)
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey("teacher_profiles.id"), nullable=False)

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    time_limit = db.Column(db.Integer, nullable=False)  # minutes
    passing_score = db.Column(db.Float, default=60.0)  # percentage
    total_points = db.Column(db.Float, default=100.0)

    status = db.Column(db.Enum("draft", "published", "archived", name="exam_status"), default="draft")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    course = db.relationship("Course", backref=db.backref("exams", lazy="dynamic"))
    teacher = db.relationship("TeacherProfile", backref=db.backref("exams", lazy="dynamic"))

    __table_args__ = (
        db.Index('idx_exams_course_id', 'course_id'),
        db.Index('idx_exams_teacher_id', 'teacher_id'),
    )


# ------------------------
# Exam Questions
# ------------------------
class ExamQuestion(db.Model):
    __tablename__ = "exam_questions"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = db.Column(UUID(as_uuid=True), db.ForeignKey("exams.id"), nullable=False)

    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.Enum("multiple_choice", "short_answer", "essay", name="question_type"), default="multiple_choice")
    options = db.Column(JSONB, nullable=True)  # For multiple choice: {A: "option", B: "option", ...}
    correct_answer = db.Column(db.String(500), nullable=False)  # Could be A, B, C or text
    points = db.Column(db.Float, default=10.0)
    order = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    exam = db.relationship("Exam", backref=db.backref("questions", lazy="dynamic"))

    __table_args__ = (
        db.Index('idx_exam_questions_exam_id', 'exam_id'),
    )


# ------------------------
# Exam Attempts
# ------------------------
class ExamAttempt(db.Model):
    __tablename__ = "exam_attempts"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = db.Column(UUID(as_uuid=True), db.ForeignKey("exams.id"), nullable=False)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey("student_profiles.id"), nullable=False)

    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Float, nullable=True)
    passed = db.Column(db.Boolean, nullable=True)
    answers = db.Column(JSONB, default={})  # {question_id: answer_text}

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    exam = db.relationship("Exam", backref=db.backref("attempts", lazy="dynamic"))

    __table_args__ = (
        db.Index('idx_exam_attempts_exam_id', 'exam_id'),
        db.Index('idx_exam_attempts_student_id', 'student_id'),
    )