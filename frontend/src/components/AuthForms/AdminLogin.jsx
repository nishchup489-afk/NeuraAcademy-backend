import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import "./AuthForms.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [securityVerified, setSecurityVerified] = useState(false);

  const questions = [
    {
      question: "What is the admin key?",
      field: "admin_key",
      correctAnswers: ["nishchup", "one_piece", "One_piece"]
    },
    {
      question: "What is the admin secret?",
      field: "admin_secret",
      correctAnswers: ["one piece", "9296292178", "onepiece"]
    },
    {
      question: "What is the name of the One Archeologist?",
      field: "name_one_archaeologist",
      correctAnswers: ["nico robin", "Nico Robin", "robin"]
    }
  ];

  const [answers, setAnswers] = useState({
    admin_key: "",
    admin_secret: "",
    name_one_archaeologist: ""
  });

  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleAnswerChange = (e) => {
    setError("");
    setAnswers({
      ...answers,
      [questions[currentQuestion].field]: e.target.value
    });
  };

  const handleCredentialChange = (e) => {
    setError("");
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const checkAnswer = async (e) => {
    e.preventDefault();
    const currentQ = questions[currentQuestion];
    const userAnswer = answers[currentQ.field].trim().toLowerCase();
    const isCorrect = currentQ.correctAnswers.some(
      ans => ans.toLowerCase() === userAnswer
    );

    if (!isCorrect) {
      setError("Incorrect answer. Please try again.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setError("");
    } else {
      // All questions answered correctly
      setSecurityVerified(true);
      setError("");
    }
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login/admin", credentials);
      // On successful login, navigate to admin dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setError("");
    } else {
      navigate("/");
    }
  };

  const q = questions[currentQuestion];

  // Security Questions Phase
  if (!securityVerified) {
    return (
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <div className="auth-logo">🛡️ NeuraAcademy Admin</div>
            <h1 className="auth-title">Admin Security Verification</h1>
            <p className="auth-subtitle">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {error && (
            <div className="error-message" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <AlertCircle size={20} style={{ marginTop: "2px", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={checkAnswer}>
            <div className="form-group">
              <label className="form-label">{q.question}</label>
              <input
                type="text"
                placeholder="Enter your answer"
                value={answers[q.field]}
                onChange={handleAnswerChange}
                className="form-input"
                autoFocus
                required
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={goBack}
                className="auth-button"
                style={{ 
                  backgroundColor: "#6b7280",
                  flex: 1
                }}
              >
                {currentQuestion > 0 ? "Previous" : "Back"}
              </button>
              <button
                type="submit"
                className="auth-button"
                disabled={loading || !answers[q.field].trim()}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Processing...
                  </>
                ) : currentQuestion === questions.length - 1 ? (
                  "Verify"
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </form>

          {/* Progress Indicator */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: idx <= currentQuestion ? "#3b82f6" : "#d1d5db",
                    transition: "background-color 0.3s"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Phase (after security verification)
  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <div className="auth-logo">🛡️ NeuraAcademy Admin</div>
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">Enter your credentials</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCredentialSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={credentials.email}
              onChange={handleCredentialChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleCredentialChange}
              className="form-input"
              required
            />
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

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            onClick={() => {
              setSecurityVerified(false);
              setCurrentQuestion(0);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.875rem"
            }}
          >
            Back to security questions
          </button>
        </div>
      </div>
    </div>
  );
}
