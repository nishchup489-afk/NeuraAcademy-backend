import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TeacherAnalytics() {
  const { courseID } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalytics();
  }, [courseID]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        `/api/teacher/analytics/courses/${courseID}`
      );
      setAnalytics(res.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!analytics) return <div className="p-6">No analytics data</div>;

  return (
    <div className="analytics-container p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">Course Analytics</h1>

      {/* Tabs */}
      <div className="tabs flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2 px-4 font-semibold transition ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`pb-2 px-4 font-semibold transition ${
            activeTab === "exams"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Exam Performance
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`pb-2 px-4 font-semibold transition ${
            activeTab === "students"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Students
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Enrollments */}
            <div className="stats-card p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Total Enrollments</div>
              <div className="text-4xl font-bold text-blue-600">
                {analytics.total_enrollments}
              </div>
              <div className="text-sm text-green-600 mt-2">
                ✓ {analytics.completed_enrollments} completed
              </div>
            </div>

            {/* Card 2: Rating */}
            <div className="stats-card p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600 mb-1">Average Rating</div>
              <div className="text-4xl font-bold text-yellow-600">
                {analytics.average_rating}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                ({analytics.total_ratings} ratings)
              </div>
            </div>

            {/* Card 3: Progress */}
            <div className="stats-card p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Avg Student Progress</div>
              <div className="text-4xl font-bold text-green-600">
                {analytics.average_progress}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${analytics.average_progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="course-info p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Course Information</h2>
            <p className="text-gray-700 mb-2">
              <strong>Title:</strong> {analytics.course_title}
            </p>
          </div>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <div>
          {analytics.exam_performance.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No exams created yet</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {analytics.exam_performance.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="exam-card p-6 bg-white border rounded-lg shadow"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    {exam.exam_title}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="stat">
                      <div className="text-sm text-gray-600">Total Attempts</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {exam.total_attempts}
                      </div>
                    </div>

                    <div className="stat">
                      <div className="text-sm text-gray-600">Average Score</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {exam.average_score}%
                      </div>
                    </div>

                    <div className="stat">
                      <div className="text-sm text-gray-600">Passed</div>
                      <div className="text-2xl font-bold text-green-600">
                        {exam.passed_count}
                      </div>
                    </div>

                    <div className="stat">
                      <div className="text-sm text-gray-600">Pass Rate</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {exam.pass_rate}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Pass Rate</span>
                      <span className="font-semibold">{exam.pass_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${exam.pass_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div>
          <div className="text-center text-gray-500 py-12">
            <p>Student enrollment details would be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
}
