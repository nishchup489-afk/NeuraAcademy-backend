import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Menu, X, CheckCircle, LogOut, Play } from "lucide-react";

export default function StudentLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
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

  const fetchLessonContent = async (lessonId) => {
    try {
      const res = await api.get(`/student/lessons/${lessonId}/content`);
      setLessonContent(res.data);
    } catch (error) {
      console.error("Error fetching lesson content:", error);
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
              {lessonContent.embed_url && (
                <div className="mb-8 bg-black rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="500"
                    src={lessonContent.embed_url}
                    frameBorder="0"
                    allowFullScreen
                    title={selectedLesson?.title}
                  ></iframe>
                </div>
              )}

              {/* Content */}
              {lessonContent.content && (
                <div className="bg-gray-800 rounded-lg p-6 text-gray-100">
                  <h3 className="text-xl font-bold text-white mb-4">Lesson Content</h3>
                  <div className="prose prose-invert max-w-none">
                    {typeof lessonContent.content === "string" ? (
                      <p>{lessonContent.content}</p>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: JSON.stringify(lessonContent.content, null, 2) }} />
                    )}
                  </div>
                </div>
              )}

              {/* No Content */}
              {!lessonContent.embed_url && !lessonContent.content && (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No content available for this lesson yet.</p>
                </div>
              )}
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
