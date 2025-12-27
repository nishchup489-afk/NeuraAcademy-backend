import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function StudentExams() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get(`/student/courses/${courseId}/exams`);
        setExams(res.data.exams ?? []);
        setAttempts(res.data.attempts ?? []);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [courseId]);

  const handleStartExam = (examId) => navigate(`/student/exams/${examId}/attempt`);
  const handleViewResult = (attemptId) => navigate(`/student/exams/attempts/${attemptId}/result`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading exams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 font-medium mb-1 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "available" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Available Exams
          </button>
          <button
            onClick={() => setActiveTab("attempts")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "attempts" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Attempts
          </button>
        </div>

        {/* Available Exams */}
        {activeTab === "available" && (
          <div>
            {exams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No exams available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => {
                  const attemptCount = attempts.filter((a) => a.exam_id === exam.id).length;
                  const bestScore = attempts
                    .filter((a) => a.exam_id === exam.id)
                    .map((a) => a.score)
                    .sort((a, b) => b - a)[0];

                  return (
                    <div
                      key={exam.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{exam.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{exam.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-600">Questions</p>
                            <p className="font-bold text-gray-900">{exam.question_count || 0}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-600">Time Limit</p>
                            <p className="font-bold text-gray-900">{exam.time_limit || "N/A"} min</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-600">Passing Score</p>
                            <p className="font-bold text-gray-900">{exam.passing_score || 0}%</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-600">Your Attempts</p>
                            <p className="font-bold text-gray-900">{attemptCount}</p>
                          </div>
                        </div>

                        {bestScore && (
                          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-gray-600">Best Score</p>
                            <p className="text-2xl font-bold text-green-600">{bestScore}%</p>
                          </div>
                        )}

                        <button
                          onClick={() => handleStartExam(exam.id)}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Take Exam
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* My Attempts */}
        {activeTab === "attempts" && (
          <div>
            {attempts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">You haven't attempted any exams yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Exam</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Attempted</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attempts.map((attempt) => {
                      const exam = exams.find((e) => e.id === attempt.exam_id);
                      const isPassed = attempt.score >= (exam?.passing_score || 60);

                      return (
                        <tr key={attempt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{exam?.title || "Unknown Exam"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(attempt.attempted_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}>
                              {attempt.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {isPassed ? "Passed" : "Failed"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button onClick={() => handleViewResult(attempt.id)} className="text-blue-600 hover:text-blue-800 font-medium">
                              View Result
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
