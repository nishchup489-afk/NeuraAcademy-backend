import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Edit2,
  LogOut,
  Award,
  Users,
  Phone,
  MapPin,
} from "lucide-react";

export default function TeacherProfileView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/teacher/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 404) navigate("/teacher/profile");
    } finally {
      setLoading(false);
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="text-gray-500 text-lg">Loading profile...</span>
      </div>
    );

  if (!profile)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="text-red-500 text-lg">Profile not found</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100/10 to-purple-300/10 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/teacher/profile")}
            className="flex items-center gap-1 px-4 py-2 font-semibold text-white rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <Edit2 size={18} /> Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 font-semibold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="relative h-52 bg-gradient-to-br from-indigo-500 to-purple-600">
          {/* Avatar */}
          {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.first_name}
                className="absolute -bottom-16 left-6 w-36 h-36 rounded-xl border-4 border-white object-cover"
              />
            ) : (
              <div className="absolute -bottom-16 left-6 w-36 h-36 rounded-xl border-4 border-white bg-gray-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                {profile.first_name?.charAt(0)}
                {profile.last_name?.charAt(0)}
              </div>
            )}

        </div>

        {/* Info Section */}
        <div className="pt-20 pb-8 px-6 space-y-6">
          {/* Name & Role */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-500 mt-1">Teacher</p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center bg-gray-100 p-4 rounded-lg">
              <div>
                <div className="text-indigo-600 font-bold text-2xl">
                  {profile.years_experience || 0}
                </div>
                <div className="text-gray-500 text-sm">Years Exp</div>
              </div>
              <div>
                <div className="text-indigo-600 font-bold text-2xl">
                  {profile.total_students || 0}
                </div>
                <div className="text-gray-500 text-sm">Students</div>
              </div>
              <div>
                <div className="text-indigo-600 font-bold text-2xl">
                  {profile.total_courses || 0}
                </div>
                <div className="text-gray-500 text-sm">Courses</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                <FileText size={18} className="text-indigo-500" /> About
              </h3>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
          )}

          {/* Teaching Info */}
          {(profile.platform_name || profile.education_info) && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                <Award size={18} className="text-indigo-500" /> Teaching Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.platform_name && (
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                    <Users size={20} className="text-indigo-500 flex-shrink-0" />
                    <div>
                      <div className="text-gray-500 text-sm">Platform/School</div>
                      <div className="text-gray-800 font-medium">{profile.platform_name}</div>
                    </div>
                  </div>
                )}
                {profile.education_info && (
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-400">
                    <Award size={20} className="text-yellow-400 flex-shrink-0" />
                    <div>
                      <div className="text-gray-500 text-sm">Education</div>
                      <div className="text-gray-800 font-medium">{profile.education_info}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.phone && (
                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <Phone size={20} className="text-green-500 flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-sm">Phone</div>
                    <div className="text-gray-800 font-medium">
                      {profile.country_code} {profile.phone}
                    </div>
                  </div>
                </div>
              )}
              {profile.country && (
                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                  <MapPin size={20} className="text-red-500 flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-sm">Location</div>
                    <div className="text-gray-800 font-medium">{profile.country}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(profile.github || profile.linkedin || profile.x || profile.facebook || profile.instagram) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Social Profiles</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-800 hover:text-white transition-transform transform hover:-translate-y-1"
                  >
                    <Github size={20} /> GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-100 border-2 border-blue-500 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-700 hover:text-white transition-transform transform hover:-translate-y-1"
                  >
                    <Linkedin size={20} /> LinkedIn
                  </a>
                )}
                {profile.x && (
                  <a
                    href={profile.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 border-2 border-blue-400 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-600 hover:text-white transition-transform transform hover:-translate-y-1"
                  >
                    <Twitter size={20} /> X
                  </a>
                )}
                {profile.facebook && (
                  <a
                    href={profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-100 border-2 border-blue-500 text-blue-800 rounded-lg font-semibold text-sm hover:bg-blue-800 hover:text-white transition-transform transform hover:-translate-y-1"
                  >
                    <Facebook size={20} /> Facebook
                  </a>
                )}
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-pink-100 border-2 border-pink-500 text-pink-600 rounded-lg font-semibold text-sm hover:bg-pink-600 hover:text-white transition-transform transform hover:-translate-y-1"
                  >
                    <Instagram size={20} /> Instagram
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
