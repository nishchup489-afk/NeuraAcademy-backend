import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapters, createChapters, updateChapter, deleteChapter } from "../../../api/course";

export default function Chapters() {
  const { courseID } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
  }, [courseID]);

  const fetchChapters = async () => {
    try {
      const res = await getChapters(courseID);
      setChapters(res.data);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () =>
    setChapters([...chapters, { chapter_id: null, title: "", description: "", order: chapters.length + 1, status: "draft" }]);

  const updateChapterField = (index, field, value) => {
    const updated = [...chapters];
    updated[index][field] = value;
    setChapters(updated);
  };

  const deleteChapterHandler = async (index) => {
    const chapter = chapters[index];
    if (chapter.chapter_id && window.confirm("Delete this chapter?")) {
      try {
        await deleteChapter(courseID, chapter.chapter_id);
        const updated = chapters.filter((_, i) => i !== index);
        setChapters(updated);
      } catch (error) {
        console.error("Error deleting chapter:", error);
      }
    }
  };

  const saveChapters = async () => {
    setSaving(true);
    try {
      const newChapters = chapters.filter(ch => !ch.chapter_id);
      if (newChapters.length > 0) {
        await createChapters(courseID, newChapters);
      }
      for (const ch of chapters.filter(c => c.chapter_id)) {
        await updateChapter(courseID, ch.chapter_id, { title: ch.title, description: ch.description });
      }
      await fetchChapters();
      alert("Chapters saved successfully!");
    } catch (error) {
      console.error("Error saving chapters:", error);
      alert("Error saving chapters");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading chapters...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Chapters</h1>
              <p className="text-gray-600 mt-1">Organize your course content into chapters</p>
            </div>
            <button
              onClick={() => navigate(`/teacher/course/${courseID}/dashboard`)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {chapters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-xl text-gray-600 mb-6">No chapters yet. Create your first chapter!</p>
            <button
              onClick={addChapter}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              + Add Chapter
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Chapter ${i + 1} Title`}
                        value={ch.title}
                        onChange={(e) => updateChapterField(i, "title", e.target.value)}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none w-full transition"
                      />
                      <p className="text-sm text-gray-500 mt-2">Chapter {ch.order}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ch.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {ch.status}
                    </span>
                  </div>

                  <textarea
                    placeholder="Chapter description (optional)"
                    value={ch.description || ""}
                    onChange={(e) => updateChapterField(i, "description", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows="2"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/teacher/course/${courseID}/chapters/${ch.chapter_id}/lessons`)}
                      disabled={!ch.chapter_id}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      📝 View Lessons
                    </button>
                    {ch.chapter_id && (
                      <button
                        onClick={() => deleteChapterHandler(i)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={addChapter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition mb-4"
              >
                + Add Chapter
              </button>
              <button
                onClick={saveChapters}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {saving ? "Saving..." : "💾 Save All Chapters"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
