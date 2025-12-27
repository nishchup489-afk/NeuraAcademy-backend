import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import * as courseAPI from "../api/course";
import { LogOut, User, BookOpen, Users, DollarSign, Star, ChartBar } from "lucide-react";
import Chatbot from "../components/Chatbot";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    thumbnail_url: ""
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
      navigate(`/teacher/course/${res.data.course_id}/dashboard`);
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const publishCourse = async (courseId) => {
    try {
      await courseAPI.publishCourse(courseId);
      fetchTeacherData();
      alert("Course published successfully!");
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Failed to publish course");
    }
  };

  const archiveCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to archive this course?")) {
      try {
        await courseAPI.archiveCourse(courseId);
        fetchTeacherData();
        alert("Course archived successfully!");
      } catch (error) {
        console.error("Error archiving course:", error);
        alert("Failed to archive course");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your dashboard...</p>
        </div>
        <Chatbot floating />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">NeuraAcademy Teacher</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate("/teacher/profile/view")}
              className="text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              <User size={18} /> Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Welcome */}
        <section className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            Welcome back, <span className="text-indigo-600">{dashboard?.first_name || "Teacher"}</span>!
            <ChartBar size={32} className="text-indigo-500" />
          </h2>
          <p className="text-gray-600 mt-2">Manage your courses, track student progress, and view analytics.</p>
        </section>

        {/* Stats */}
        {dashboard && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Courses", value: dashboard.total_courses, icon: <BookOpen size={28} className="text-blue-500" /> },
              { label: "Total Students", value: dashboard.total_students, icon: <Users size={28} className="text-green-500" /> },
              { label: "Total Revenue", value: `$${dashboard.total_revenue.toFixed(2)}`, icon: <DollarSign size={28} className="text-green-600" /> },
              { label: "Avg Rating", value: (dashboard.average_rating || 0).toFixed(1), icon: <Star size={28} className="text-yellow-500" /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition flex items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">{stat.icon}</div>
                <div>
                  <p className="text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Create Course */}
        <section>
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
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <h3 className="text-xl font-semibold mb-6">Create New Course</h3>
              <form onSubmit={createCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Thumbnail URL (optional)"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        </section>

        {/* Courses Grid */}
        <section>
          {dashboard?.courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-indigo-500" />
              <p className="text-xl text-gray-600 mb-4">You haven't created any courses yet</p>
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
                <div key={course.id} className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
                  <img src={course.thumbnail_url || '/images/course_.jpg'} alt={course.title} className="w-full h-40 object-cover" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">{course.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.status === "published"
                            ? "bg-green-100 text-green-800"
                            : course.status === "archived"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between"><span>Students</span><span className="font-semibold">{course.enrollments}</span></div>
                      <div className="flex justify-between"><span>Rating</span><span className="font-semibold">{course.average_rating}</span></div>
                      {course.revenue > 0 && <div className="flex justify-between"><span>Revenue</span><span className="font-semibold">${course.revenue.toFixed(2)}</span></div>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/teacher/course/${course.id}/dashboard`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm"
                      >
                        Manage
                      </button>
                      {course.status !== "published" && (
                        <button
                          onClick={() => publishCourse(course.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition text-sm"
                        >
                          Publish
                        </button>
                      )}
                      {course.status !== "archived" && (
                        <button
                          onClick={() => archiveCourse(course.id)}
                          className="px-3 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-semibold transition text-sm"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Chatbot floating />
    </div>
  );
}
