import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const analyticsRes = await api.get("/student/analytics");
      setAnalytics(analyticsRes.data);

      const coursesRes = await api.get("/student/analytics/courses");
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-600 mt-2">Track your learning analytics and performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {analytics.active_courses || 0}
                </p>
              </div>
              <span className="text-4xl">📚</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {analytics.average_score || 0}%
                </p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Consistency</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {analytics.consistency_rate || 0}%
                </p>
              </div>
              <span className="text-4xl">🔥</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Global Rank</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  #{analytics.global_rank || "N/A"}
                </p>
              </div>
              <span className="text-4xl">🏆</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Learning Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Learning Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total Hours
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.total_hours || 0}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((analytics.total_hours || 0) / 100) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Lessons Completed
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.completed_lessons || 0}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Exams Taken
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.exams_taken || 0}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Certificates Earned
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.certificates_earned || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Exam Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Highest Score
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.highest_score || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${analytics.highest_score || 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Lowest Score
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.lowest_score || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${analytics.lowest_score || 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Pass Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {analytics.pass_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${analytics.pass_rate || 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Median Score:{" "}
                  <span className="font-bold text-gray-900">
                    {analytics.median_score || 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Analytics */}
        {courses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Course Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Time Spent
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${course.completion_percentage || 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-900">
                            {course.completion_percentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {course.average_score || 0}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {course.hours_spent || 0}h
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            course.is_completed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.is_completed ? "Completed" : "In Progress"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
