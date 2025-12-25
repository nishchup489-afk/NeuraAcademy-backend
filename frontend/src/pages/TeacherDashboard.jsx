import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as courseAPI from "../api/course";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD"
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const res = await courseAPI.getTeacherDashboard();
      setDashboard(res.data);
    } catch (error) {
      console.error("Error fetching teacher dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await courseAPI.createCourse(formData);
      setFormData({ title: "", description: "", price: 0, currency: "USD" });
      setShowCreateForm(false);
      // Navigate to course dashboard
      navigate(`/teacher/course/${res.data.course_id}/dashboard`);
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      window.location.href = "/auth/login/teacher";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">NeuraAcademy Teacher</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate("/teacher/profile")}
              className="text-gray-600 hover:text-gray-900"
            >
              👤 Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, Teacher! 👋</h2>
          <p className="text-gray-600">Manage your courses, track student progress, and view analytics</p>
        </div>

        {/* Stats Section */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboard.total_courses}
                  </p>
                </div>
                <div className="text-4xl">📚</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-green-600">
                    {dashboard.total_students}
                  </p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${dashboard.total_revenue.toFixed(2)}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    4.5⭐
                  </p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Course Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">My Courses</h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {showCreateForm ? "Cancel" : "+ New Course"}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold mb-6">Create New Course</h3>
              <form onSubmit={createCourse}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value)
                        })
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <textarea
                  placeholder="Course Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  rows="4"
                />

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Create Course
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {dashboard?.courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600 mb-4">
              You haven't created any courses yet
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard?.courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {course.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                        course.status === "published"
                          ? "bg-green-100 text-green-800"
                          : course.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>👥 Students</span>
                      <span className="font-semibold">{course.enrollments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⭐ Rating</span>
                      <span className="font-semibold">{course.average_rating}</span>
                    </div>
                    {course.revenue > 0 && (
                      <div className="flex justify-between">
                        <span>💰 Revenue</span>
                        <span className="font-semibold">
                          ${course.revenue.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/teacher/course/${course.id}/dashboard`)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Manage Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
