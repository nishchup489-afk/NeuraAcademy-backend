import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLessons, createLesson, updateLesson, deleteLesson } from "../../../api/course";

export default function Lessons() {
  const { chapterID, courseID } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchLessons();
  }, [chapterID]);

  const fetchLessons = async () => {
    try {
      const res = await getLessons(chapterID);
      setLessons(res.data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLesson = async () => {
    try {
      const res = await createLesson(chapterID, {
        title: "New Lesson",
        order: lessons.length + 1
      });
      await fetchLessons();
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const startEdit = (lesson) => {
    setEditingId(lesson.lesson_id);
    setEditForm(lesson);
  };

  const saveEdit = async () => {
    try {
      await updateLesson(chapterID, editingId, editForm);
      await fetchLessons();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const removelesson = async (lessonId) => {
    if (window.confirm("Delete this lesson?")) {
      try {
        await deleteLesson(chapterID, lessonId);
        await fetchLessons();
      } catch (error) {
        console.error("Error deleting lesson:", error);
      }
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading lessons...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chapter Lessons</h1>
              <p className="text-gray-600 mt-1">Manage lessons within this chapter</p>
            </div>
            <button
              onClick={() => navigate(`/teacher/course/${courseID}/chapters`)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Chapters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-xl text-gray-600 mb-6">No lessons yet. Create your first lesson!</p>
            <button
              onClick={addLesson}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              + Add Lesson
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.lesson_id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-purple-500"
                >
                  {editingId === lesson.lesson_id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="text-2xl font-bold border-b-2 border-blue-500 outline-none w-full pb-2"
                      />
                      <input
                        type="text"
                        placeholder="Embed URL (YouTube, etc.)"
                        value={editForm.embed_url || ""}
                        onChange={(e) => setEditForm({ ...editForm, embed_url: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">{lesson.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">Lesson {lesson.order}</p>
                          {lesson.embed_url && (
                            <p className="text-sm text-gray-600 mt-2">🎬 {lesson.embed_url}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${lesson.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {lesson.status}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/teacher/course/${courseID}/chapters/${chapterID}/lessons/${lesson.lesson_id}/content`)}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          ✏️ Edit Content
                        </button>
                        <button
                          onClick={() => startEdit(lesson)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          🔧 Edit Info
                        </button>
                        <button
                          onClick={() => removelesson(lesson.lesson_id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addLesson}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              + Add Lesson
            </button>
          </>
        )}
      </div>
    </div>
  );
}
