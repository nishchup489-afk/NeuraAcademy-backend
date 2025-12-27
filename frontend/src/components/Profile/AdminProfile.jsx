import { useState } from "react"
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Upload, Github, Facebook, Linkedin, Instagram, Twitter, Phone, MapPin, User, FileText, Shield } from "lucide-react";
import "./ProfileForm.css";

export default function AdminProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    avatar: null,
    first_name: "",
    last_name: "",
    date_of_birth: "",
    country_code: "+1",
    country: "",
    phone: "",
    bio: "",
    employee_id: "",
    department: "",
    github: "",
    facebook: "",
    x: "",
    linkedin: "",
    instagram: "",
  })

  const countryCodes = ["+1", "+44", "+91", "+61", "+81", "+880"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData()

    for (let key in form) {
      if (form[key]) formData.append(key, form[key])
    }

    try {
      const res = await api.post("/admin/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      })
      console.log("admin profile updated", res.data)
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
      console.error(err.response?.data || err.message)
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      const file = files[0];
      setForm({ ...form, [name]: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-header">
          <h1 className="profile-title">Admin Profile Setup</h1>
          <p className="profile-subtitle">Complete your admin profile information</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Avatar Section */}
          <div className="form-section">
            <h2 className="section-title">Profile Picture</h2>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {preview ? (
                  <img src={preview} alt="Preview" />
                ) : (
                  <>
                    <Upload size={32} />
                    <p>Click to upload</p>
                  </>
                )}
                <input
                  type="file"
                  name="avatar"
                  id="avatar"
                  onChange={handleChange}
                  accept="image/*"
                  className="file-input"
                />
              </div>
              <p className="helper-text">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h2 className="section-title">
              <User size={20} /> Basic Information
            </h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={form.first_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="form-section">
            <h2 className="section-title">
              <Shield size={20} /> Admin Information
            </h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  name="employee_id"
                  placeholder="e.g., ADM-001"
                  value={form.employee_id}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g., Content Management"
                  value={form.department}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h2 className="section-title">
              <MapPin size={20} /> Location
            </h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g., United States"
                  value={form.country}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country Code</label>
                <select
                  name="country_code"
                  value={form.country_code}
                  onChange={handleChange}
                  className="form-input"
                >
                  {countryCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="form-section">
            <h2 className="section-title">
              <FileText size={20} /> About You
            </h2>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={form.bio}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
              ></textarea>
            </div>
          </div>

          {/* Social Links */}
          <div className="form-section">
            <h2 className="section-title">Social Links</h2>
            <p className="section-desc">Add your social profiles (optional)</p>

            <div className="social-links">
              <div className="form-group">
                <label className="form-label">
                  <Github size={18} /> GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  placeholder="https://github.com/username"
                  value={form.github}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Linkedin size={18} /> LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Twitter size={18} /> X (Twitter)
                </label>
                <input
                  type="url"
                  name="x"
                  placeholder="https://x.com/username"
                  value={form.x}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Facebook size={18} /> Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  placeholder="https://facebook.com/username"
                  value={form.facebook}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Instagram size={18} /> Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  placeholder="https://instagram.com/username"
                  value={form.instagram}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  )
}
