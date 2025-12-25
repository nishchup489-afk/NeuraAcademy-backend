from .course import course_bp
from .chapter import chapter_bp
from .lesson import lesson_bp
from .content import content_bp
from .publish import publish_bp
from .exam import exam_bp
from .analytics import analytics_bp


def register_course_blueprints(app):
    app.register_blueprint(course_bp)
    app.register_blueprint(chapter_bp)
    app.register_blueprint(lesson_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(publish_bp)
    app.register_blueprint(exam_bp)
    app.register_blueprint(analytics_bp)
