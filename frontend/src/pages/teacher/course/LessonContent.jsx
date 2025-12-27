import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLessonContent,
  updateLessonContent
} from "../../../api/course";
import SimpleTipTap from "../../../components/editor/SimpleTipTap";
import Chatbot from "../../../components/Chatbot";
import {
  Globe,
  X,
  Save,
  ArrowLeft,
  Video,
  FileText
} from "lucide-react";

export default function LessonContent() {
  const { lessonID, chapterID, courseID } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading content...
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
              Edit Lesson Content
            </h1>
            <p className="text-gray-600 mt-1">{content.title}</p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/teacher/course/${courseID}/chapters/${chapterID}/lessons`
              )
            }
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Lessons
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-10">
          {/* Embed URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Video size={20} className="text-gray-700" />
              <label className="text-lg font-semibold text-gray-900">
                Embed URL
              </label>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Add a YouTube or external video embed link
            </p>

            <input
              type="url"
              placeholder="https://www.youtube.com/embed/..."
              value={content.embed_url || ""}
              onChange={(e) =>
                setContent({ ...content, embed_url: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {content.embed_url && (
              <div className="mt-4 rounded-lg overflow-hidden border">
                <iframe
                  width="100%"
                  height="400"
                  src={content.embed_url}
                  title="Lesson Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Lesson Content */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-gray-700" />
              <label className="text-lg font-semibold text-gray-900">
                Lesson Content
              </label>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Write lesson content with rich text formatting
            </p>

            <div className="border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
              <SimpleTipTap
                value={
                  typeof content.content === "string"
                    ? JSON.parse(content.content)
                    : content.content
                }
                onChange={(html) =>
                  setContent({ ...content, content: html })
                }
              />
            </div>
          </div>

          {/* Chatbot */}
          <Chatbot fixed lessonId={lessonID} />

          {/* Wiki Button */}
          {!wikiOpen && (
            <button
              onClick={() => setWikiOpen(true)}
              className="fixed bottom-8 left-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 z-50"
            >
              <Globe size={22} />
            </button>
          )}

          {wikiOpen && (
            <div className="fixed bottom-8 right-8 w-96 h-[500px] bg-white border rounded-lg shadow-xl z-50 flex flex-col">
              <div className="flex justify-between items-center bg-indigo-600 text-white p-3">
                <span className="font-medium">Wikipedia</span>
                <button onClick={() => setWikiOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <iframe
                src="https://en.wikipedia.org/wiki/Special:Random"
                className="flex-1 w-full"
                title="Wikipedia"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Content"}
            </button>

            <button
              onClick={() =>
                navigate(
                  `/teacher/course/${courseID}/chapters/${chapterID}/lessons`
                )
              }
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
