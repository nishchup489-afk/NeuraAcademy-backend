import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Star, Users, BookOpen, Clock, ChevronDown, LogOut } from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(0);


  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const res = await api.get(`/student/courses/${courseId}`);
        setCourse(res.data);
        setEnrolled(res.data.is_enrolled || false);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [courseId]);



  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/student/courses/${courseId}/enroll`);
      setEnrolled(true);
      alert("Successfully enrolled! Redirecting to learning...");
      navigate(`/student/learn/${courseId}`);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Failed to enroll. Please try again.");
    } finally {
      setEnrolling(false);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <button
            onClick={() => navigate("/student/explore")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraAcademy</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student/explore")}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Browse More
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Hero */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg h-96 mb-8 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={80} className="text-white opacity-20" />
                </div>
              )}
            </div>

            {/* Course Title & Meta */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(course.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">({course.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={20} />
                  {course.enrolled_count} students enrolled
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-4">{course.description}</p>

              {/* Course Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">Instructor</p>
                  <p className="font-semibold text-gray-900">{course.teacher_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Level</p>
                  <p className="font-semibold text-gray-900">{course.level || "All Levels"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Duration</p>
                  <p className="font-semibold text-gray-900">{course.duration || "Self-paced"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Chapters</p>
                  <p className="font-semibold text-gray-900">{course.chapter_count || 0}</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {course.requirements && (
              <div className="mb-8 bg-white p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                <p className="text-gray-600">{course.requirements}</p>
              </div>
            )}

            {/* Course Content */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Course Content</h3>
              <div className="space-y-4">
                {course.chapters && course.chapters.length > 0 ? (
                  course.chapters.map((chapter, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedChapter(expandedChapter === idx ? -1 : idx)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <h4 className="font-semibold text-gray-900">{chapter.title}</h4>
                        <ChevronDown
                          size={20}
                          className={`text-gray-600 transition ${expandedChapter === idx ? "rotate-180" : ""}`}
                        />
                      </button>
                      {expandedChapter === idx && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                          <div className="space-y-2">
                            {chapter.lessons && chapter.lessons.length > 0 ? (
                              chapter.lessons.map((lesson, lidx) => (
                                <div key={lidx} className="flex items-center gap-3 text-gray-700 py-2">
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                  <span>{lesson.title}</span>
                                  {lesson.is_completed && <span className="text-green-600 text-sm">✓ Completed</span>}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">No lessons yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Course content coming soon</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Enroll Card */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <p className="text-4xl font-bold text-indigo-600 mb-4">₹{course.price}</p>
              {enrolled ? (
                <button
                  onClick={() => navigate(`/student/learn/${course.id}`)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold mb-3"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              )}

              <div className="space-y-3 border-t pt-6">
                <h4 className="font-semibold text-gray-900">This course includes:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-indigo-600" />
                    <span>{course.chapter_count || 0} chapters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-indigo-600" />
                    <span>{course.enrolled_count} enrolled students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-indigo-600" />
                    <span>Self-paced learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
