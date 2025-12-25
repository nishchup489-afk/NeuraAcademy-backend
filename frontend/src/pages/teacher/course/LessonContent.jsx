import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLessonContent,
  updateLessonContent
} from "../../../api/course";
import SimpleTipTap from "../../../components/editor/SimpleTipTap";

export default function LessonContent() {
  const { lessonID, chapterID, courseID } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [lessonID]);

  const fetchContent = async () => {
    try {
      const res = await getLessonContent(lessonID);
      setContent(res.data);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateLessonContent(lessonID, {
        content: content.content,
        embed_url: content.embed_url
      });
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading content...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Lesson Content</h1>
              <p className="text-gray-600 mt-1">{content.title}</p>
            </div>
            <button
              onClick={() => navigate(`/teacher/course/${courseID}/chapters/${chapterID}/lessons`)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Lessons
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Embed URL Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-2">📺 Embed URL</label>
            <p className="text-gray-600 text-sm mb-4">Add a YouTube or external video embed link</p>
            <input
              type="url"
              placeholder="https://www.youtube.com/embed/..."
              value={content.embed_url || ""}
              onChange={(e) => setContent({ ...content, embed_url: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {content.embed_url && (
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-300">
                <iframe
                  width="100%"
                  height="400"
                  src={content.embed_url}
                  title="Lesson Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-2">📝 Lesson Content</label>
            <p className="text-gray-600 text-sm mb-4">Write your lesson content with rich text formatting</p>
            <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
              <SimpleTipTap 
                value={typeof content.content === "string" ? JSON.parse(content.content) : content.content}
                onChange={(html) => setContent({ ...content, content: html })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {saving ? "Saving..." : "💾 Save Content"}
            </button>
            <button
              onClick={() => navigate(`/teacher/course/${courseID}/chapters/${chapterID}/lessons`)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
