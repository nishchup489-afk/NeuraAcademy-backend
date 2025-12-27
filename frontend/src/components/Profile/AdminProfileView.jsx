import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone, FileText, Github, Linkedin, Twitter, Facebook, Instagram, Edit2, LogOut, Shield } from "lucide-react";
import "./ProfileView.css";

export default function AdminProfileView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/admin/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      // If profile not found, redirect to profile setup
      if (err.response?.status === 404) {
        navigate("/admin/profile");
      }
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
        <button onClick={() => navigate("/admin/dashboard")} className="back-button">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="header-actions">
          <button onClick={() => navigate("/admin/profile")} className="edit-button">
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
            <div className="profile-role-badge">
              <Shield size={16} /> Admin
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">{profile.employee_id || '-'}</div>
              <div className="stat-label">Employee ID</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.department || '-'}</div>
              <div className="stat-label">Department</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.country || '-'}</div>
              <div className="stat-label">Location</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="profile-section">
              <h3 className="section-heading">About</h3>
              <p className="section-content">{profile.bio}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="profile-section">
            <h3 className="section-heading">Contact Information</h3>
            <div className="contact-items">
              {profile.email && (
                <div className="contact-item">
                  <Mail size={18} />
                  <div>
                    <p className="contact-label">Email</p>
                    <a href={`mailto:${profile.email}`} className="contact-value">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="contact-item">
                  <Phone size={18} />
                  <div>
                    <p className="contact-label">Phone</p>
                    <p className="contact-value">
                      {profile.country_code} {profile.phone}
                    </p>
                  </div>
                </div>
              )}

              {profile.country && (
                <div className="contact-item">
                  <MapPin size={18} />
                  <div>
                    <p className="contact-label">Location</p>
                    <p className="contact-value">{profile.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(profile.github || profile.linkedin || profile.x || profile.facebook || profile.instagram) && (
            <div className="profile-section">
              <h3 className="section-heading">Social Links</h3>
              <div className="social-links-view">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                    <Github size={20} /> GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                    <Linkedin size={20} /> LinkedIn
                  </a>
                )}
                {profile.x && (
                  <a href={profile.x} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <Twitter size={20} /> X
                  </a>
                )}
                {profile.facebook && (
                  <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <Facebook size={20} /> Facebook
                  </a>
                )}
                {profile.instagram && (
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
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
