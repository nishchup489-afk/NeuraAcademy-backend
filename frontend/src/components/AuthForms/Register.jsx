import { useState } from "react";
import api from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, Github } from "lucide-react";
import "./AuthForms.css";

export default function Register({ role }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!form.email || !form.username || !form.password || !form.confirm_password) {
      setError("All fields are required");
      return false;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = `/auth/register/${role}`;
      const res = await api.post(url, form);
      setSuccess("Registration successful! Please check your email to confirm.");
      setTimeout(() => {
        navigate(`/auth/login/${role}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    const roleMap = {
      student: "Student",
      teacher: "Teacher",
      parent: "Parent"
    };
    return roleMap[role] || role;
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <div className="auth-logo">NeuraAcademy</div>
          <h1 className="auth-title">Join as {getRoleDisplay()}</h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <Check size={18} style={{ display: "inline", marginRight: "0.5rem" }} />
            {success}
          </div>
        )}

        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.75rem'}}>
          {(() => {
            const base = api?.defaults?.baseURL || '';
            const backendBase = base.startsWith('http') ? base.replace(/\/$/, '') : `${window.location.origin.replace(/\/$/, '')}${base.startsWith('/') ? '' : '/'}${base.replace(/\/$/, '')}`;
            const next = encodeURIComponent(window.location.origin);
            return (
              <>
                <button
                  onClick={() => { window.location.href = `${backendBase}/auth/oauth/google?role=${role}&next=${next}` }}
                  type="button"
                  className="auth-oauth-button google"
                >
                  Continue with Google
                </button>

                <button
                  onClick={() => { window.location.href = `${backendBase}/auth/oauth/github?role=${role}&next=${next}` }}
                  type="button"
                  className="auth-oauth-button github"
                >
                  <Github size={16} style={{marginRight: '0.5rem'}} /> GitHub
                </button>
              </>
            );
          })()}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="form-input-group">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm_password"
                placeholder="Re-enter your password"
                value={form.confirm_password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-signup-link">
          Already have an account?{" "}
          <Link to={`/auth/login/${role}`}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}