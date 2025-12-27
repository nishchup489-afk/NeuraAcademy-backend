import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getLessonComments, createLessonComment, deleteLessonComment } from "../../api/course";
import { Menu, X, CheckCircle, LogOut, Play } from "lucide-react";
import Chatbot from '../../components/Chatbot'

// Helper function to convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  // If already in embed format, return as is
  if (url.includes("youtube.com/embed/") || url.includes("youtube-nocookie.com/embed/")) return url;
  
  // Extract video ID from various YouTube URL formats
  let videoId = null;
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes("youtube.com/watch")) {
    const match = url.match(/v=([^&]+)/);
    if (match) videoId = match[1];
  }
  // Format: https://youtu.be/VIDEO_ID
  else if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?&]+)/);
    if (match) videoId = match[1];
  }
  // Format: https://www.youtube.com/embed/VIDEO_ID
  else if (url.includes("youtube.com/embed/")) {
    return url;
  }
  
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  
  // Unsupported or non-video YouTube URL — do not attempt to embed
  return null;
};

export default function StudentLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await api.get(`/student/courses/${courseId}/learn`);
        setCourse(res.data);
        setChapters(res.data.chapters || []);

        if (res.data.chapters?.length > 0 && res.data.chapters[0].lessons?.length > 0) {
          setSelectedLesson(res.data.chapters[0].lessons[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (selectedLesson) {
      fetchLessonContent(selectedLesson.id);
    }
  }, [selectedLesson]);

  const fetchComments = useCallback(async (lessonId) => {
    setCommentsLoading(true);
    try {
      const res = await getLessonComments(lessonId);
      setComments(res.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const fetchLessonContent = useCallback(async (lessonId) => {
    try {
      const res = await api.get(`/student/lessons/${lessonId}/content`);
      setLessonContent(res.data);
      fetchComments(lessonId);
    } catch (error) {
      console.error("Error fetching lesson content:", error);
    }
  }, [fetchComments]);

  

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedLesson) return;
    try {
      await createLessonComment(selectedLesson.id, { content: commentText.trim() });
      setCommentText("");
      await fetchComments(selectedLesson.id);
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteLessonComment(commentId);
      await fetchComments(selectedLesson.id);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson) return;
    setCompletingLesson(true);
    try {
      await api.post(`/student/lessons/${selectedLesson.id}/complete`);
      // Update UI to show lesson as completed
      setSelectedLesson({ ...selectedLesson, is_completed: true });
      alert("Lesson marked as complete!");
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Course not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } bg-gray-800 text-white overflow-y-auto transition-all duration-300 flex flex-col`}
      >
        {sidebarOpen && (
          <>
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold truncate">{course.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{course.completion_percentage}% complete</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${course.completion_percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chapters.map((chapter, cIdx) => (
                <div key={cIdx} className="border-b border-gray-700">
                  <div className="p-4 font-semibold text-sm bg-gray-700/50">{chapter.title}</div>
                  <div className="space-y-1 p-2">
                    {chapter.lessons?.map((lesson, lIdx) => (
                      <button
                        key={lIdx}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left px-4 py-2 rounded transition text-sm flex items-center gap-2 ${
                          selectedLesson?.id === lesson.id
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-700"
                        }`}
                      >
                        {lesson.is_completed && <CheckCircle size={16} />}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700 space-y-2">
              <button
                onClick={() => navigate("/student/dashboard")}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded transition"
          >
            {sidebarOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
          <h1 className="text-white font-bold text-xl flex-1 ml-4">NeuraAcademy</h1>
        </header>

        {/* Video/Content Area */}
        <div className="flex-1 overflow-auto bg-gray-900 p-6">
          {lessonContent ? (
            <div className="max-w-4xl mx-auto">
              {/* Lesson Title */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedLesson?.title}</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleMarkComplete}
                    disabled={completingLesson || selectedLesson?.is_completed}
                    className={`px-4 py-2 rounded transition flex items-center gap-2 font-medium ${
                      selectedLesson?.is_completed
                        ? "bg-green-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    }`}
                  >
                    {selectedLesson?.is_completed ? (
                      <>
                        <CheckCircle size={18} /> Completed
                      </>
                    ) : (
                      <>
                        <Play size={18} /> {completingLesson ? "Marking..." : "Mark as Complete"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Embed URL */}
              {(() => {
                const embedUrl = getYouTubeEmbedUrl(lessonContent.embed_url);
                if (embedUrl) {
                  return (
                    <div className="mb-8 bg-black rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="500"
                        src={embedUrl}
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={selectedLesson?.title}
                      ></iframe>
                    </div>
                  );
                }

                if (lessonContent.embed_url) {
                  return (
                    <div className="mb-8 bg-gray-800 rounded-lg p-4 text-gray-300">
                      <p>This video cannot be embedded. <a href={lessonContent.embed_url} target="_blank" rel="noreferrer" className="text-indigo-400">Open in YouTube</a></p>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Content */}
              {lessonContent.content && (
                <div className="bg-gray-800 rounded-lg p-6 text-gray-100">
                  <h3 className="text-xl font-bold text-white mb-4">Lesson Content</h3>
                  <div className="prose prose-invert max-w-none">
                    {typeof lessonContent.content === "string" ? (
                      <p>{lessonContent.content}</p>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: renderTiptapContent(lessonContent.content) }} />
                    )}
                  </div>
                </div>
              )}

              {/* Chatbot - fixed below lesson content */}
              <Chatbot fixed lessonId={selectedLesson?.id} />

              {/* No Content */}
              {!lessonContent.embed_url && !lessonContent.content && (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No content available for this lesson yet.</p>
                </div>
              )}

              {/* Comments */}
              <div className="mt-6 max-w-4xl mx-auto">
                <h4 className="text-lg font-semibold text-white mb-3">Discussion</h4>
                <div className="space-y-3 mb-4">
                  {commentsLoading ? (
                    <p className="text-gray-400">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-gray-400">Be the first to comment</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="bg-gray-700 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.student_name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-semibold">{(c.student_name || 'S').slice(0,2).toUpperCase()}</div>
                            )}

                            <div>
                              <div className="text-sm font-semibold text-white">{c.student_name || 'Student'}</div>
                              <div className="text-gray-300 text-sm">{new Date(c.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                          <div>
                            <button onClick={() => handleDeleteComment(c.id)} className="text-sm text-red-400">Delete</button>
                          </div>
                        </div>
                        <p className="text-gray-200 mt-2">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gray-800 p-4 rounded">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700"
                    placeholder="Write a comment..."
                  />
                  <div className="flex justify-end mt-3">
                    <button onClick={handleSubmitComment} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Post Comment</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a lesson to view content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Basic renderer for Tiptap/ProseMirror JSON to HTML for common node types
function renderTiptapContent(doc) {
  if (!doc) return "";

  // If it's already HTML string
  if (typeof doc === "string") return escapeHtml(doc);

  const nodes = doc.content || [];

  const renderNode = (node) => {
    if (!node || !node.type) return "";
    const type = node.type;
    const content = (node.content || []).map(renderNode).join("");

    switch (type) {
      case "paragraph":
        return `<p>${content}</p>`;
      case "heading": {
        const level = node.attrs && node.attrs.level ? node.attrs.level : 2;
        return `<h${level}>${content}</h${level}>`;
      }
      case "text": {
        let text = escapeHtml(node.text || "");
        if (node.marks && node.marks.length) {
          node.marks.forEach((m) => {
            if (m.type === "bold") text = `<strong>${text}</strong>`;
            if (m.type === "italic") text = `<em>${text}</em>`;
            if (m.type === "link" && m.attrs && m.attrs.href) text = `<a href="${escapeAttr(m.attrs.href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
          });
        }
        return text;
      }
      case "bullet_list":
        return `<ul>${content}</ul>`;
      case "ordered_list":
        return `<ol>${content}</ol>`;
      case "list_item":
        return `<li>${content}</li>`;
      case "image": {
        const src = node.attrs && node.attrs.src ? escapeAttr(node.attrs.src) : "";
        const alt = node.attrs && node.attrs.alt ? escapeAttr(node.attrs.alt) : "";
        return `<img src="${src}" alt="${alt}" style="max-width:100%"/>`;
      }
      case "blockquote":
        return `<blockquote>${content}</blockquote>`;
      case "code_block": {
        return `<pre><code>${escapeHtml(node.content && node.content[0] && node.content[0].text || "")}</code></pre>`;
      }
      default:
        return content;
    }
  };

  return nodes.map(renderNode).join("");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "%22");
}
