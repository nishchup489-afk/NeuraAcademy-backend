import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, BookOpen, LogOut } from "lucide-react";

export default function StudentAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/student/analytics");
      setAnalytics(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraAcademy</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/student/dashboard")} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Dashboard</button>
            <button onClick={() => { api.get("/auth/logout"); navigate("/"); }} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Your Analytics</h2>

        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Courses</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{analytics.active_courses}</p>
                  </div>
                  <BookOpen size={32} className="text-indigo-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Score</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{Math.round(analytics.average_score)}%</p>
                  </div>
                  <Award size={32} className="text-purple-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Exams Taken</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{analytics.exams_taken}</p>
                  </div>
                  <TrendingUp size={32} className="text-green-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div>
                  <p className="text-gray-600 text-sm">Pass Rate</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{Math.round(analytics.pass_rate)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Score Distribution</h3>
              <div className="space-y-2">
                <p className="text-gray-600">Highest: {Math.round(analytics.highest_score)}% | Lowest: {Math.round(analytics.lowest_score)}% | Median: {Math.round(analytics.median_score)}%</p>
                <p className="text-gray-600">Consistency: {analytics.consistency_rate}% | Completed: {analytics.completed_lessons} lessons</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
