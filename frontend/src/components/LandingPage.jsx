import { Link } from "react-router-dom";
import './LandingPage.css'

export default function LandingPage() {
  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="landing-header">
        <div className="logo">NeuraAcademy</div>

        <nav className="nav-links">
          <a href="#courses">Courses</a>
          <a href="#teachers">For Teachers</a>
          <a href="#parents">For Parents</a>
          <a href="#about">About</a>
        </nav>

        <div className="auth-actions">
          <button className="btn ghost"><Link to="/auth/login/student">Student Login</Link></button>
          <button className="btn ghost"><Link to="/auth/login/teacher">Teacher Login</Link></button>
          <button className="btn ghost"><Link to="/auth/login/parent">Parent Login</Link></button>
          <button className="btn primary"><Link to="/auth/register/student">Register</Link></button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Learn Smarter.<br />Teach Better.<br />Track Everything.</h1>
            <p>NeuraAcademy is an intelligent learning platform for students, teachers, and parents — powered by analytics, AI, and consistency.</p>
            <div className="hero-cta">
              <Link to="/auth/register"><button className="btn primary">Start Learning</button></Link>
              <a href="#courses"><button className="btn outline">Explore Courses</button></a>
            </div>
          </div>
          <div className="hero-visual">
            {/* illustration / animation placeholder */}
          </div>
        </section>

        {/* ================= ROLES ================= */}
        <section className="roles-section">
          <h2>Built for Everyone in Education</h2>
          <div className="roles-grid">
            <div className="role-card student">
              <h3>Students</h3>
              <p>Structured courses, exams, analytics, consistency tracking, friends ranking, and AI assistance.</p>
              <Link to="/auth/login/student">Login as Student</Link>
              <br />
              <Link to="/auth/register/student">Register as Student</Link>
            </div>

            <div className="role-card teacher">
              <h3>Teachers</h3>
              <p>Create courses, add docs/videos, manage exams, analyze students, and grow your reach.</p>
              <Link to="/auth/login/teacher">Login as Teacher</Link>
              <br />
              <Link to="/auth/register/teacher">Register as Teacher</Link>
            </div>

            <div className="role-card parent">
              <h3>Parents</h3>
              <p>Monitor your child's progress, view analytics, teacher feedback, and rankings.</p>
              <Link to="/auth/login/parent">Login as Parent</Link>
              <br />
              <Link to="/auth/register/parent">Register as Parent</Link>
            </div>

            <div className="role-card admin">
              <h3>Admin</h3>
              <p>Access full platform management, reports, and analytics.</p>
              <Link to="/auth/login/admin">Login as Admin</Link>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="features-section">
          <h2>Why NeuraAcademy?</h2>
          <div className="features-grid">
            <div className="feature">
              <h4>📊 Deep Analytics</h4>
              <p>Track progress, consistency, scores, and engagement.</p>
            </div>
            <div className="feature">
              <h4>🧠 AI Assistance</h4>
              <p>Built-in AI for learning, teaching, and insights.</p>
            </div>
            <div className="feature">
              <h4>👥 Social Learning</h4>
              <p>Friends, rankings, messaging, and motivation.</p>
            </div>
            <div className="feature">
              <h4>📝 Structured Content</h4>
              <p>Docs, videos, exams, and timed assessments.</p>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="final-cta">
          <h2>Start Your Learning Journey Today</h2>
          <p>No noise. No fake motivation. Just real progress.</p>
          <Link to="/auth/register"><button className="btn primary large">Create your free account</button></Link>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} NeuraAcademy. All rights reserved.</p>
      </footer>
    </>
  );
}
