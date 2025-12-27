import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function TeacherProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    avatar: null,
    first_name: "",
    last_name: "",
    date_of_birth: "",
    country_code: "+1",
    country: "",
    phone: "",
    bio: "",
    github: "",
    facebook: "",
    x: "",
    linkedin: "",
    instagram: "",
    platform_name: "",
    education_info: "",
    years_experience: 0,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const countryCodes = ["+1", "+44", "+91", "+61", "+81", "+880"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      setForm((prev) => ({ ...prev, avatar: files[0] }));
      setAvatarPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null) formData.append(key, value);
      });

      await api.post("/teacher/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-800">Basic Info</h2>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="avatar" className="font-semibold text-gray-700">
            Profile Picture
          </label>
          <div className="w-40 h-40 border rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No image selected</span>
            )}
          </div>
          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        {/* Name, DOB, Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <select
            name="country_code"
            value={form.country_code}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          >
            {countryCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />
        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="url"
            name="github"
            placeholder="Github URL"
            value={form.github}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="url"
            name="facebook"
            placeholder="Facebook URL"
            value={form.facebook}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="url"
            name="x"
            placeholder="X URL"
            value={form.x}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="url"
            name="linkedin"
            placeholder="LinkedIn URL"
            value={form.linkedin}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="url"
            name="instagram"
            placeholder="Instagram URL"
            value={form.instagram}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </div>

        {/* Teacher-Specific Info */}
        <h2 className="text-2xl font-bold text-gray-800 mt-6">Teacher Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="platform_name"
            placeholder="Platform Name"
            value={form.platform_name}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="text"
            name="education_info"
            placeholder="Education Info"
            value={form.education_info}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="number"
            name="years_experience"
            placeholder="Years of Experience"
            value={form.years_experience}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Submit Profile
        </button>
      </form>
    </div>
  );
}
