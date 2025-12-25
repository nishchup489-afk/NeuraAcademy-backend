import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Search, Filter, Star, Users, Clock, LogOut } from "lucide-react";

export default function ExploreCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, sortBy, filterLevel]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/student/courses/available");
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (filterLevel !== "all") {
      filtered = filtered.filter((course) => (course.level || "").toLowerCase() === filterLevel.toLowerCase());
    }

    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popularity":
        filtered.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default: // latest
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredCourses(filtered);
  };

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraAcademy</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Dashboard
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h2>
          <p className="text-gray-600 text-lg">Find and enroll in amazing courses to accelerate your learning journey.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Filter Level */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="latest">Latest</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/student/course/${course.id}`)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
                  <img
                    src={course.thumbnail || "https://via.placeholder.com/300x200?text=Course"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {course.level || "All"}
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>

                  {/* Teacher */}
                  <p className="text-sm text-gray-600 mb-3">{course.teacher_name}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(course.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">({course.review_count})</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {course.enrolled_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {course.chapter_count} chapters
                    </div>
                  </div>

                  {/* Price & Button */}
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-indigo-600">₹{course.price}</p>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <p className="text-gray-600 text-lg mb-4">No courses found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterLevel("all");
                setSortBy("latest");
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
