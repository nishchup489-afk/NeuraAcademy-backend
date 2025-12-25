import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Clock, CheckCircle, XCircle, LogOut } from "lucide-react";

export default function StudentExams() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get(`/student/courses/${courseId}/exams`);
        setExams(res.data.exams || []);
        setAttempts(res.data.attempts || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [courseId]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraAcademy</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Exams & Quizzes</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Exams</h3>
            <div className="space-y-4">
              {exams.length > 0 ? exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{exam.title}</h4>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Clock size={16} /> {exam.time_limit} min</div>
                    <div>Questions: {exam.question_count}</div>
                  </div>
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                    Start Exam
                  </button>
                </div>
              )) : (
                <p className="text-gray-500">No exams available</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Attempts</h3>
            <div className="space-y-4">
              {attempts.length > 0 ? attempts.map((att, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-gray-900">Attempt {idx + 1}</h4>
                    <span className={`font-bold ${att.score >= 60 ? "text-green-600" : "text-red-600"}`}>
                      {Math.round(att.score)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{att.attempted_at}</p>
                </div>
              )) : (
                <p className="text-gray-500">No attempts yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
