import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

export default function Exams() {
  const { courseID } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit: 60,
    passing_score: 60.0,
    total_points: 100.0
  });

  const fetchExams = useCallback(async () => {
    try {
      const res = await api.get(
        `/teacher/courses/${courseID}/exams`
      );
      const data = res.data;
      if (Array.isArray(data)) {
        setExams(data);
      } else if (data && Array.isArray(data.exams)) {
        setExams(data.exams);
      } else {
        setExams([]);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  }, [courseID]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const createExam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/teacher/courses/${courseID}/exams`,
        formData
      );
      navigate(`/teacher/course/${courseID}/exams/${res.data.exam_id}`);
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Error creating exam");
    }
  };

  const deleteExam = async (examID) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await api.delete(
          `/teacher/courses/${courseID}/exams/${examID}`
        );
        setExams(exams.filter(e => e.id !== examID));
        alert("Exam deleted successfully");
      } catch (error) {
        console.error("Error deleting exam:", error);
        alert("Error deleting exam");
      }
    }
  };

  if (loading) return <div className="p-6">Loading exams...</div>;

  const examsArr = Array.isArray(exams) ? exams : [];

  return (
    <div className="exams-container p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Exams</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "+ New Exam"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createExam} className="mb-8 p-4 bg-gray-50 rounded">
          <h2 className="text-xl font-semibold mb-4">Create New Exam</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Exam Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Time Limit (minutes)"
              value={formData.time_limit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit: parseInt(e.target.value)
                })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Passing Score (%)"
              value={formData.passing_score}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passing_score: parseFloat(e.target.value)
                })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Total Points"
              value={formData.total_points}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_points: parseFloat(e.target.value)
                })
              }
              className="border p-2 rounded"
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded w-full mb-4"
            rows="3"
          />

          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Create Exam
          </button>
        </form>
      )}

      {examsArr.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No exams yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examsArr.map((exam) => (
            <div
              key={exam.id}
              className="exam-card p-4 border rounded-lg bg-white shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold">{exam.title}</h3>
                  <p className="text-gray-600 text-sm">{exam.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    exam.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {exam.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <div>⏱️ {exam.time_limit} min</div>
                <div>📊 {exam.question_count} questions</div>
                <div>✅ Pass: {exam.passing_score}%</div>
                <div>📈 Total: {exam.total_points} pts</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/teacher/course/${courseID}/exams/${exam.id}`
                    )
                  }
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExam(exam.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
