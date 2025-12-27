import { useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Github } from "lucide-react";
import "./AuthForms.css";

export default function Login({ role }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = `/auth/login/${role}`;
      const res = await api.post(url, form);
      const userRole = res.data.user.role;

      const profileRes = await api.get("/auth/check_profile");
      const profileExists = profileRes.data.profile_exists;

      if (profileExists) {
        if (userRole === "student") navigate("/student/dashboard");
        if (userRole === "teacher") navigate("/teacher/dashboard");
        if (userRole === "parent") navigate("/parent/dashboard");
      } else {
        if (userRole === "student") navigate("/student/profile");
        if (userRole === "teacher") navigate("/teacher/profile");
        if (userRole === "parent") navigate("/parent/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    const roleMap = {
      student: "Student",
      teacher: "Teacher",
      parent: "Parent",
      admin: "Admin"
    };
    return roleMap[role] || role;
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <div className="auth-logo">NeuraAcademy</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in as {getRoleDisplay()}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

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
                  Sign in with Google
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
            <label className="form-label">Password</label>
            <div className="form-input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
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

          <div className="auth-links">
            <Link to="/auth/forgot_password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-signup-link">
          Don't have an account?{" "}
          <Link to={`/auth/register/${role}`}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}