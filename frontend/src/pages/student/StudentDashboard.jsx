import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { BookOpen, Award, TrendingUp, Users, LogOut } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/student/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraAcademy</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student/profile")}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">You're doing great! Keep up the momentum.</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Courses</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{dashboard.active_courses}</p>
              </div>
              <BookOpen size={32} className="text-indigo-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Score</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{Math.round(dashboard.avg_score)}%</p>
              </div>
              <Award size={32} className="text-purple-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Consistency</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{dashboard.consistency}%</p>
              </div>
              <TrendingUp size={32} className="text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Global Rank</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">#{dashboard.global_rank}</p>
              </div>
              <Users size={32} className="text-orange-200" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Active Courses</h3>
              {dashboard.courses && dashboard.courses.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.courses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/student/learn/${course.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <span className="text-sm text-indigo-600 font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{course.chapters} chapters</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active courses yet</p>
                  <button
                    onClick={() => navigate("/student/explore")}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Explore Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/student/explore")}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <BookOpen size={18} /> Browse Courses
                </button>
                <button
                  onClick={() => navigate("/student/analytics")}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <TrendingUp size={18} /> View Analytics
                </button>
                <button
                  onClick={() => navigate("/student/friends")}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Users size={18} /> Friends & Social
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboard.recent_exams && dashboard.recent_exams.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Exam Results</h3>
            <div className="space-y-3">
              {dashboard.recent_exams.slice(0, 5).map((exam, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-900">{exam.title}</p>
                    <p className="text-sm text-gray-500">{exam.attempted_at}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${exam.score >= 60 ? "text-green-600" : "text-red-600"}`}>
                      {Math.round(exam.score)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
