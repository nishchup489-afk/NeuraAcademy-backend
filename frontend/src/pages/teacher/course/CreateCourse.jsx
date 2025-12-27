import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../../api/course";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", price: 0, currency: "USD" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a course title");
      return;
    }
    
    setLoading(true);
    try {
      const res = await createCourse(form);
      navigate(`/teacher/course/${res.data.course_id}/dashboard`);
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-blue-purple text-white py-12 shadow-lg">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="text-white hover:text-blue-100 mb-6 font-medium transition"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Create a New Course</h1>
          <p className="text-blue-100 text-lg">Start building your next course and inspire learners</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              📚 Course Title
            </label>
            <input
              type="text"
              placeholder="Enter an engaging course title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="form-input w-full text-lg"
            />
            <p className="text-sm text-gray-500 mt-2">Make it clear and descriptive</p>
          </div>

          {/* Thumbnail will be uploaded via Course dashboard (after creation) */}

          {/* Description Field */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              📝 Description
            </label>
            <textarea
              placeholder="Describe what students will learn in this course..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="6"
              className="form-textarea w-full text-lg"
            />
            <p className="text-sm text-gray-500 mt-2">Be specific about the course content and learning outcomes</p>
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                💰 Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="form-input w-full"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-900 text-sm">
              💡 <strong>Tip:</strong> You can edit all these details and add chapters and lessons after creating the course.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-blue-purple hover:shadow-lg disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner" style={{width: "20px", height: "20px"}}></div>
                Creating Course...
              </span>
            ) : (
              "✨ Create Course"
            )}
          </button>

          {/* Features List */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <p className="text-sm font-medium text-gray-700">Add Chapters</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm font-medium text-gray-700">Create Lessons</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-700">Track Analytics</p>
            </div>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>Need help? <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">View documentation</a></p>
        </div>
      </div>
    </div>
  );
}
