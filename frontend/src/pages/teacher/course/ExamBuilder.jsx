import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";

export default function ExamBuilder() {
  const { courseID, examID } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examID) {
      fetchExam();
    }
  }, [courseID, examID]);

  const fetchExam = async () => {
    try {
      const res = await api.get(
        `/teacher/courses/${courseID}/exams/${examID}`
      );
      setExam(res.data);
      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error("Error fetching exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateExamField = (field, value) => {
    setExam({ ...exam, [field]: value });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: null,
      question_text: "",
      type: "multiple_choice",
      options: { A: "", B: "", C: "", D: "" },
      correct_answer: "A",
      points: 10,
      order: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateQuestionOption = (index, optionKey, value) => {
    const updated = [...questions];
    updated[index].options[optionKey] = value;
    setQuestions(updated);
  };

  const removeQuestion = async (index) => {
    const question = questions[index];
    if (question.id) {
      try {
        await api.delete(
          `/teacher/courses/${courseID}/exams/${examID}/questions/${question.id}`
        );
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const saveExam = async () => {
    setSaving(true);
    try {
      // Update exam metadata
      if (examID) {
        await api.put(
          `/teacher/courses/${courseID}/exams/${examID}`,
          {
            title: exam.title,
            description: exam.description,
            time_limit: exam.time_limit,
            passing_score: exam.passing_score,
            total_points: exam.total_points
          }
        );
      }

      // Save questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.id) {
          await api.put(
            `/teacher/courses/${courseID}/exams/${examID}/questions/${q.id}`,
            {
              question_text: q.question_text,
              question_type: q.type,
              options: q.options,
              correct_answer: q.correct_answer,
              points: q.points
            }
          );
        } else {
          await api.post(
            `/teacher/courses/${courseID}/exams/${examID}/questions`,
            {
              question_text: q.question_text,
              question_type: q.type,
              options: q.options,
              correct_answer: q.correct_answer,
              points: q.points
            }
          );
        }
      }

      alert("Exam saved successfully!");
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Error saving exam");
    } finally {
      setSaving(false);
    }
  };

  const publishExam = async () => {
    if (questions.length === 0) {
      alert("Add at least one question before publishing");
      return;
    }

    try {
      await api.post(
        `/teacher/courses/${courseID}/exams/${examID}/publish`
      );
      alert("Exam published successfully!");
      setExam({ ...exam, status: "published" });
    } catch (error) {
      console.error("Error publishing exam:", error);
      alert("Error publishing exam");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!exam) return <div>Exam not found</div>;

  return (
    <div className="exam-builder p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">{exam.title}</h1>

      <div className="exam-settings mb-8 p-4 bg-gray-50 rounded">
        <h2 className="text-xl font-semibold mb-4">Exam Settings</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Exam Title"
            value={exam.title}
            onChange={(e) => updateExamField("title", e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Time Limit (minutes)"
            value={exam.time_limit}
            onChange={(e) =>
              updateExamField("time_limit", parseInt(e.target.value))
            }
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Passing Score (%)"
            value={exam.passing_score}
            onChange={(e) =>
              updateExamField("passing_score", parseFloat(e.target.value))
            }
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Total Points"
            value={exam.total_points}
            onChange={(e) =>
              updateExamField("total_points", parseFloat(e.target.value))
            }
            className="border p-2 rounded"
          />
        </div>

        <textarea
          placeholder="Description"
          value={exam.description}
          onChange={(e) => updateExamField("description", e.target.value)}
          className="border p-2 rounded w-full"
          rows="3"
        />
      </div>

      <div className="questions-section">
        <h2 className="text-2xl font-semibold mb-4">Questions ({questions.length})</h2>

        {questions.map((q, idx) => (
          <div key={idx} className="question-card mb-6 p-4 border rounded bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Question {idx + 1}</h3>
              <button
                onClick={() => removeQuestion(idx)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>

            <textarea
              placeholder="Question text"
              value={q.question_text}
              onChange={(e) => updateQuestion(idx, "question_text", e.target.value)}
              className="border p-2 rounded w-full mb-4"
              rows="2"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                value={q.type}
                onChange={(e) => updateQuestion(idx, "type", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay</option>
              </select>

              <input
                type="number"
                placeholder="Points"
                value={q.points}
                onChange={(e) =>
                  updateQuestion(idx, "points", parseFloat(e.target.value))
                }
                className="border p-2 rounded"
              />
            </div>

            {q.type === "multiple_choice" && (
              <div className="options-section mb-4">
                <p className="font-semibold mb-2">Options:</p>
                {Object.entries(q.options || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <label className="font-semibold w-8">{key}:</label>
                    <input
                      type="text"
                      placeholder={`Option ${key}`}
                      value={value}
                      onChange={(e) =>
                        updateQuestionOption(idx, key, e.target.value)
                      }
                      className="border p-2 rounded flex-1"
                    />
                    <input
                      type="radio"
                      name={`correct_${idx}`}
                      value={key}
                      checked={q.correct_answer === key}
                      onChange={() => updateQuestion(idx, "correct_answer", key)}
                    />
                  </div>
                ))}
              </div>
            )}

            {q.type === "short_answer" && (
              <input
                type="text"
                placeholder="Correct answer"
                value={q.correct_answer}
                onChange={(e) =>
                  updateQuestion(idx, "correct_answer", e.target.value)
                }
                className="border p-2 rounded w-full mb-4"
              />
            )}

            {q.type === "essay" && (
              <p className="text-sm text-gray-600 mb-4">
                Essay questions require manual grading
              </p>
            )}
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mb-6"
        >
          + Add Question
        </button>
      </div>

      <div className="action-buttons flex gap-4">
        <button
          onClick={saveExam}
          disabled={saving}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Exam"}
        </button>
        {exam.status === "draft" && (
          <button
            onClick={publishExam}
            className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
          >
            Publish Exam
          </button>
        )}
        {exam.status === "published" && (
          <span className="text-green-600 font-semibold">
            ✓ Published
          </span>
        )}
      </div>
    </div>
  );
}
