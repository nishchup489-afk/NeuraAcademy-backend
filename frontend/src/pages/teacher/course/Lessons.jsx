import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  publishLesson
} from "../../../api/course";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Pencil,
  Settings,
  Rocket,
  Trash2,
  Save,
  X,
  Video
} from "lucide-react";

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
      await createLesson(chapterID, {
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

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading lessons...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chapter Lessons
            </h1>
            <p className="text-gray-600 mt-1">
              Manage lessons within this chapter
            </p>
          </div>

          <button
            onClick={() => navigate(`/teacher/course/${courseID}/chapters`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Chapters
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen size={56} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-6">
              No lessons yet. Create your first lesson.
            </p>
            <button
              onClick={addLesson}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Plus size={18} />
              Add Lesson
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {lessons.map((lesson) => (
                <div
                  key={lesson.lesson_id}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500"
                >
                  {editingId === lesson.lesson_id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            title: e.target.value
                          })
                        }
                        className="text-2xl font-bold border-b-2 border-indigo-500 outline-none w-full pb-2"
                      />

                      <div className="relative">
                        <Video
                          size={18}
                          className="absolute top-3 left-3 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Embed URL"
                          value={editForm.embed_url || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              embed_url: e.target.value
                            })
                          }
                          className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Lesson {lesson.order}
                          </p>
                          {lesson.embed_url && (
                            <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                              <Video size={14} />
                              {lesson.embed_url}
                            </p>
                          )}
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            lesson.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/teacher/course/${courseID}/chapters/${chapterID}/lessons/${lesson.lesson_id}/content`
                            )
                          }
                          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Pencil size={16} />
                          Edit Content
                        </button>

                        <button
                          onClick={() => startEdit(lesson)}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Settings size={16} />
                          Edit Info
                        </button>

                        {lesson.status !== "published" && (
                          <button
                            onClick={async () => {
                              try {
                                await publishLesson(
                                  chapterID,
                                  lesson.lesson_id
                                );
                                await fetchLessons();
                                alert("Lesson published");
                              } catch (err) {
                                console.error(err);
                                alert("Error publishing lesson");
                              }
                            }}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                          >
                            <Rocket size={16} />
                            Publish
                          </button>
                        )}

                        <button
                          onClick={() =>
                            removelesson(lesson.lesson_id)
                          }
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addLesson}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Plus size={18} />
              Add Lesson
            </button>
          </>
        )}
      </div>
    </div>
  );
}
