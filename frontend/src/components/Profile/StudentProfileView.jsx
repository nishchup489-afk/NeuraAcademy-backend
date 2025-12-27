import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone, FileText, Github, Linkedin, Twitter, Facebook, Instagram, Edit2, LogOut } from "lucide-react";
import "./ProfileView.css";

export default function StudentProfileView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/student/profile");
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setLoading(false);
      // If profile not found, redirect to profile setup
      if (err.response?.status === 404) {
        setTimeout(() => navigate("/student/profile"), 100);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
      <div className="profile-view-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-view-container">
        <div className="error">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="profile-view-container">
      {/* Header */}
      <div className="profile-view-header">
        <button onClick={() => navigate("/student/dashboard")} className="back-button">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="header-actions">
          <button onClick={() => navigate("/student/profile")} className="edit-button">
            <Edit2 size={18} /> Edit Profile
          </button>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-view-content">
        {/* Cover & Avatar */}
        <div className="profile-cover">
          <div className="cover-background"></div>
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.first_name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="profile-name-section">
            <h1 className="profile-name">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="profile-role">Student</p>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">0</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat">
              <div className="stat-value">0</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat">
              <div className="stat-value">0</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="profile-section">
              <h3 className="section-heading">
                <FileText size={18} /> About
              </h3>
              <p className="section-content">{profile.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="profile-section">
            <h3 className="section-heading">Contact Information</h3>
            <div className="contact-grid">
              {profile.phone && (
                <div className="contact-item">
                  <Phone size={18} className="contact-icon" />
                  <div>
                    <div className="contact-label">Phone</div>
                    <div className="contact-value">{profile.country_code} {profile.phone}</div>
                  </div>
                </div>
              )}
              {profile.country && (
                <div className="contact-item">
                  <MapPin size={18} className="contact-icon" />
                  <div>
                    <div className="contact-label">Location</div>
                    <div className="contact-value">{profile.country}</div>
                  </div>
                </div>
              )}
              {profile.date_of_birth && (
                <div className="contact-item">
                  <Mail size={18} className="contact-icon" />
                  <div>
                    <div className="contact-label">Date of Birth</div>
                    <div className="contact-value">{profile.date_of_birth}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(profile.github || profile.linkedin || profile.x || profile.facebook || profile.instagram) && (
            <div className="profile-section">
              <h3 className="section-heading">Social Profiles</h3>
              <div className="social-links-view">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                    <Github size={20} />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    <Linkedin size={20} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.x && (
                  <a href={profile.x} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <Twitter size={20} />
                    <span>X</span>
                  </a>
                )}
                {profile.facebook && (
                  <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <Facebook size={20} />
                    <span>Facebook</span>
                  </a>
                )}
                {profile.instagram && (
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <Instagram size={20} />
                    <span>Instagram</span>
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
