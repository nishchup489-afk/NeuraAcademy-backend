import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "axios";
import * as courseAPI from "../../../api/course";

export default function TeacherCourseDashboard() {
  const { courseID } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [exams, setExams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseID]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch chapters
      const chaptersRes = await courseAPI.getChapters(courseID);
      setChapters(chaptersRes.data);

      // Fetch exams
      const examsRes = await courseAPI.getExams(courseID);
      setExams(examsRes.data);

      // Fetch analytics
      const analyticsRes = await courseAPI.getCourseAnalytics(courseID);
      setAnalytics(analyticsRes.data);

      // Set a basic course object
      setCourse({
        id: courseID,
        title: analyticsRes.data.course_title || "Course"
      });
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading course dashboard...</div>;
  }

  return (
    <div className="course-dashboard bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {course?.title || "Course Dashboard"}
              </h1>
              <p className="text-gray-600 mt-1">Manage your course content and analytics</p>
            </div>
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Courses
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {["overview", "chapters", "exams", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "overview" && "📊 Overview"}
                {tab === "chapters" && "📚 Chapters & Lessons"}
                {tab === "exams" && "📝 Exams"}
                {tab === "analytics" && "📈 Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-600 text-sm">Students Enrolled</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.total_enrollments}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-600 text-sm">Completed</div>
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.completed_enrollments}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-600 text-sm">Avg Rating</div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {analytics.average_rating}⭐
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-gray-600 text-sm">Avg Progress</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.average_progress}%
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">📚 Chapters</span>
                    <span className="font-bold text-lg">{chapters.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">📝 Exams</span>
                    <span className="font-bold text-lg">{exams.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">📋 Total Lessons</span>
                    <span className="font-bold text-lg">
                      {chapters.reduce((sum) => sum + 5, 0)} {/* Placeholder */}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("chapters")}
                    className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded text-blue-700 font-medium transition"
                  >
                    → Manage Chapters & Lessons
                  </button>
                  <button
                    onClick={() => setActiveTab("exams")}
                    className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded text-purple-700 font-medium transition"
                  >
                    → Create/Edit Exams
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded text-green-700 font-medium transition"
                  >
                    → View Detailed Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === "chapters" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Chapters & Lessons</h2>
              <button
                onClick={() => navigate(`/teacher/course/${courseID}/chapters`)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Manage Chapters
              </button>
            </div>

            {chapters.length === 0 ? (
              <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                <p>No chapters yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.chapter_id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {chapter.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Chapter {chapter.order}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          chapter.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {chapter.status}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `/teacher/course/${courseID}/chapters/${chapter.chapter_id}/lessons`
                        )
                      }
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Lessons →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Course Exams</h2>
              <button
                onClick={() => navigate(`/teacher/course/${courseID}/exams`)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Manage Exams
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                <p>No exams yet. Create one to assess student learning!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          exam.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <div>⏱️ {exam.time_limit} minutes</div>
                      <div>❓ {exam.question_count} questions</div>
                      <div>✅ Pass: {exam.passing_score}%</div>
                      <div>📊 {exam.total_points} points</div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/teacher/course/${courseID}/exams/${exam.id}`)
                      }
                      className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit Exam →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Course Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm">Total Enrollments</div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.total_enrollments}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ✓ {analytics.completed_enrollments} completed
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm">Average Rating</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {analytics.average_rating}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ({analytics.total_ratings} ratings)
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm">Avg Progress</div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.average_progress}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analytics.average_progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm">Exams</div>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.exam_performance.length}
                </div>
              </div>
            </div>

            {/* Exam Performance */}
            {analytics.exam_performance.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Exam Performance</h3>
                <div className="space-y-4">
                  {analytics.exam_performance.map((exam) => (
                    <div key={exam.exam_id} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold mb-2">{exam.exam_title}</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Attempts</span>
                          <div className="font-bold">{exam.total_attempts}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Score</span>
                          <div className="font-bold text-purple-600">
                            {exam.average_score}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Passed</span>
                          <div className="font-bold text-green-600">
                            {exam.passed_count}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Pass Rate</span>
                          <div className="font-bold text-orange-600">
                            {exam.pass_rate}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${exam.pass_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
