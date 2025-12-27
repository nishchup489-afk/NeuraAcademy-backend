import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ExamResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get(`/student/exams/attempts/${attemptId}/result`)
      .then(res => setResult(res.data))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return <div className="p-10 text-center">Loading result...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Result</h1>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black"
        >
          Back to Dashboard
        </button>
      </div>

      {/* RESULT BODY */}
      {result.questions.map((q, idx) => (
        <div
          key={q.id}
          className="border rounded-lg p-5 space-y-3 bg-white shadow"
        >
          <p className="font-semibold">
            Q{idx + 1}. {q.question}
          </p>

          {q.type === "mcq" ? (
            <>
              <p>
                Your Answer:{" "}
                <span
                  className={
                    q.user_answer === q.correct_answer
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {q.user_answer}
                </span>
              </p>

              <p className="text-sm text-gray-600">
                Correct Answer: {q.correct_answer}
              </p>
            </>
          ) : (
            <p className="italic text-gray-500">
              Result will be published soon.
            </p>
          )}
        </div>
      ))}

      {/* TEACHER CARD */}
      <div className="border rounded-lg p-5 flex items-center gap-4 bg-gray-50">
        <img
          src={result.teacher.avatar}
          alt={result.teacher.name}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div className="flex-1">
          <p className="font-semibold">{result.teacher.name}</p>
          <p className="text-sm text-gray-500">
            Exam Creator
          </p>
        </div>

        <button
          onClick={() => navigate(`/student/messages/${result.teacher.id}`)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Contact Teacher
        </button>
      </div>
    </div>
  );
}
