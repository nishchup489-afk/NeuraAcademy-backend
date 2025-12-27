import api from "./axios";

// Course APIs
export const createCourse = (data) =>
  api.post("/teacher/courses", data);

export const publishCourse = (courseId) =>
  api.post(`/teacher/courses/${courseId}/publish`);

export const archiveCourse = (courseId) =>
  api.post(`/teacher/courses/${courseId}/archive`);

// Chapter APIs
export const getChapters = (courseId) =>
  api.get(`/teacher/courses/${courseId}/chapters`);

export const createChapters = (courseId, chapters) =>
  api.post(`/teacher/courses/${courseId}/chapters`, { chapters });

export const updateChapter = (courseId, chapterId, data) =>
  api.put(`/teacher/courses/${courseId}/chapters/${chapterId}`, data);

export const deleteChapter = (courseId, chapterId) =>
  api.delete(`/teacher/courses/${courseId}/chapters/${chapterId}`);

export const publishChapter = (courseId, chapterId) =>
  api.post(`/teacher/courses/${courseId}/chapters/${chapterId}/publish`);

// Lesson APIs
export const getLessons = (chapterId) =>
  api.get(`/teacher/chapters/${chapterId}/lessons`);

export const createLesson = (chapterId, data) =>
  api.post(`/teacher/chapters/${chapterId}/lessons`, data);

export const updateLesson = (chapterId, lessonId, data) =>
  api.put(`/teacher/chapters/${chapterId}/lessons/${lessonId}`, data);

export const deleteLesson = (chapterId, lessonId) =>
  api.delete(`/teacher/chapters/${chapterId}/lessons/${lessonId}`);

export const publishLesson = (chapterId, lessonId) =>
  api.post(`/teacher/chapters/${chapterId}/lessons/${lessonId}/publish`);

export const getLessonContent = (lessonId) =>
  api.get(`/teacher/lessons/${lessonId}/content`);

export const updateLessonContent = (lessonId, data) =>
  api.patch(`/teacher/lessons/${lessonId}/content`, data);

// Student-facing comment/rating APIs
export const getLessonComments = (lessonId) =>
  api.get(`/student/lessons/${lessonId}/comments`);

export const createLessonComment = (lessonId, data) =>
  api.post(`/student/lessons/${lessonId}/comments`, data);

export const deleteLessonComment = (commentId) =>
  api.delete(`/student/lessons/comments/${commentId}`);

export const submitCourseRating = (courseId, data) =>
  api.post(`/student/courses/${courseId}/rating`, data);

export const getCourseReviews = (courseId) =>
  api.get(`/student/courses/${courseId}/reviews`);

// Exam APIs
export const getExams = (courseId) =>
  api.get(`/teacher/courses/${courseId}/exams`);

export const getExam = (courseId, examId) =>
  api.get(`/teacher/courses/${courseId}/exams/${examId}`);

export const createExam = (courseId, data) =>
  api.post(`/teacher/courses/${courseId}/exams`, data);

export const updateExam = (courseId, examId, data) =>
  api.put(`/teacher/courses/${courseId}/exams/${examId}`, data);

export const deleteExam = (courseId, examId) =>
  api.delete(`/teacher/courses/${courseId}/exams/${examId}`);

export const publishExam = (courseId, examId) =>
  api.post(`/teacher/courses/${courseId}/exams/${examId}/publish`);

// Exam Question APIs
export const addQuestion = (courseId, examId, data) =>
  api.post(`/teacher/courses/${courseId}/exams/${examId}/questions`, data);

export const updateQuestion = (courseId, examId, questionId, data) =>
  api.put(`/teacher/courses/${courseId}/exams/${examId}/questions/${questionId}`, data);

export const deleteQuestion = (courseId, examId, questionId) =>
  api.delete(`/teacher/courses/${courseId}/exams/${examId}/questions/${questionId}`);

// Analytics APIs
export const getCourseAnalytics = (courseId) =>
  api.get(`/teacher/analytics/courses/${courseId}`);

export const getTeacherDashboard = () =>
  api.get(`/teacher/analytics/teacher/dashboard`);

export const getCourseStudents = (courseId) =>
  api.get(`/teacher/analytics/courses/${courseId}/students`);

export const updateCourse = (courseId, data) =>
  api.put(`/teacher/courses/${courseId}`, data);

export const uploadCourseThumbnail = (courseId, formData) =>
  api.post(`/teacher/courses/${courseId}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
