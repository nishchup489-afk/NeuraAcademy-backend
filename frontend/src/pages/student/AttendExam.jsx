// src/pages/student/AttendExam.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AttendExam() {
  const params = useParams();
  const examId = params.examId || params.examID;
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/student/exams/${examId}`);
        setExam(res.data);
      } catch (err) {
        console.error(err);
        const msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : "Failed to load exam.";
        alert(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit the exam?")) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/student/exams/${examId}/attempt`, {
        answers,
      });
      alert("Exam submitted successfully!");
      navigate(`/student/exams/attempts/${res.data.attempt_id}/result`);
    } catch (err) {
      console.error(err);
      const msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : "Failed to submit exam.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600">Loading exam...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-red-600">Exam not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{exam.title}</h1>
      <p className="text-gray-600 mb-6">{exam.description}</p>
      {exam.attempt_submitted && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">You have already submitted this exam.</p>
          <p className="text-sm text-gray-700">Score: {exam.attempt_score ?? "N/A"}</p>
        </div>
      )}
      <div className="space-y-6">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">
              Q{idx + 1}. {q.question_text}
            </p>
            {q.type === "multiple_choice" &&
              q.options &&
              Object.entries(q.options).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name={q.id}
                    value={key}
                    checked={answers[q.id] === key}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                  <span>{val}</span>
                </label>
              ))}
            {(q.type === "text" || q.type === "short_answer") && (
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || exam.attempt_submitted}
        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        {submitting ? "Submitting..." : "Submit Exam"}
      </button>
    </div>
  );
}
