import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { LogOut, Users, BookOpen, TrendingUp, Shield } from "lucide-react";
import Chatbot from "../components/Chatbot";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      setDashboard(res.data);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading admin dashboard...</p>
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
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">NeuraAcademy Admin</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate("/admin/profile/view")}
              className="text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              Profile
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
        <section>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboard?.first_name || "Admin"}
          </h2>
          <p className="text-gray-600">Manage platform users, courses, content, and view platform analytics</p>
        </section>

        {/* Main Stats */}
        {dashboard && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Users", value: dashboard.total_users || 0, icon: <Users size={28} className="text-indigo-500" /> },
              { label: "Total Courses", value: dashboard.total_courses || 0, icon: <BookOpen size={28} className="text-green-500" /> },
              { label: "Active Teachers", value: dashboard.total_teachers || 0, icon: <Shield size={28} className="text-purple-500" /> },
              { label: "Avg Platform Rating", value: (dashboard.average_rating || 0).toFixed(1), icon: <TrendingUp size={28} className="text-yellow-500" /> },
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

        {/* Secondary Stats */}
        {dashboard && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Active Students", value: dashboard.total_students || 0, icon: <Users size={24} className="text-blue-600" />, bg: "bg-blue-100" },
              { label: "Total Revenue", value: `$${dashboard.total_revenue || 0}`, icon: <TrendingUp size={24} className="text-green-600" />, bg: "bg-green-100" },
              { label: "Total Lessons", value: dashboard.total_lessons || 0, icon: <BookOpen size={24} className="text-purple-600" />, bg: "bg-purple-100" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>{stat.icon}</div>
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Recent Users Table */}
        {dashboard?.recent_users?.length > 0 && (
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_users.map((user, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.first_name} {user.last_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                          user.role === 'parent' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pending Courses Table */}
        {dashboard?.pending_courses?.length > 0 && (
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Pending Courses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Course Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Instructor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.pending_courses.map((course, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.instructor_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{course.status || 'Pending'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Chatbot floating />
    </div>
  );
}
