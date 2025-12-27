import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  FileText,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Edit2,
  LogOut,
  Users,
  Briefcase,
  Home,
} from "lucide-react";
import "./ProfileView.css";

export default function ParentProfileView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/parent/profile");
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setLoading(false);
      if (err.response?.status === 404) {
        setTimeout(() => navigate("/parent/profile"), 100);
      }
    }
  }

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
        <div className="loading">Loading parent profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-view-container">
        <div className="error">Parent profile not found</div>
      </div>
    );
  }

  return (
    <div className="profile-view-container">
      <div className="profile-view-header">
        <button onClick={() => navigate("/parent/dashboard")} className="back-button">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="header-actions">
          <button onClick={() => navigate("/parent/profile")} className="edit-button">
            <Edit2 size={18} /> Edit Profile
          </button>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="profile-view-content">
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

        <div className="profile-info-section">
          <div className="profile-name-section">
            <h1 className="profile-name">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="profile-role">Parent</p>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">{profile.children ? profile.children.length : 0}</div>
              <div className="stat-label">Children</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.courses_enrolled || 0}</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.achievements || 0}</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>

          {profile.bio && (
            <div className="profile-section">
              <h3 className="section-heading">
                <FileText size={18} /> About
              </h3>
              <p className="section-content">{profile.bio}</p>
            </div>
          )}

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

              {profile.address && (
                <div className="contact-item">
                  <Home size={18} className="contact-icon" />
                  <div>
                    <div className="contact-label">Address</div>
                    <div className="contact-value">{profile.address}</div>
                  </div>
                </div>
              )}

              {profile.occupation && (
                <div className="contact-item">
                  <Briefcase size={18} className="contact-icon" />
                  <div>
                    <div className="contact-label">Occupation</div>
                    <div className="contact-value">{profile.occupation}</div>
                  </div>
                </div>
              )}

              {profile.email && (
                <div className="contact-item">
                  <Mail size={18} className="contact-icon" />
                  <div>
                    <div className="contact-label">Email</div>
                    <div className="contact-value">{profile.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {profile.children && profile.children.length > 0 && (
            <div className="profile-section">
              <h3 className="section-heading">
                <Users size={18} /> Children
              </h3>
              <div className="children-list">
                {profile.children.map((c) => (
                  <div key={c.id} className="child-card">
                    <div className="child-name">{c.first_name} {c.last_name}</div>
                    <div className="child-meta">{c.age ? `${c.age} yrs` : c.class_name || "Student"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
