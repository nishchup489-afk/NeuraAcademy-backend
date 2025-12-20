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
          <button className="btn ghost"><Link to={"/auth/login"} >Login</Link></button>
          <button className="btn primary"><Link to={"/auth/register"} >Register</Link></button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main>
        {/* ---------- HERO ---------- */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>
              Learn Smarter.  
              <br />
              Teach Better.  
              <br />
              Track Everything.
            </h1>

            <p>
              NeuraAcademy is an intelligent learning platform for students,
              teachers, and parents — powered by analytics, AI, and consistency.
            </p>

            <div className="hero-cta">
              <button className="btn primary">Start Learning</button>
              <button className="btn outline">Explore Courses</button>
            </div>
          </div>

          <div className="hero-visual">
            {/* later: illustration / animation */}
          </div>
        </section>

        {/* ---------- ROLE PRESENTATION ---------- */}
        <section className="roles-section">
          <h2>Built for Everyone in Education</h2>

          <div className="roles-grid">
            <div className="role-card student">
              <h3>Students</h3>
              <p>
                Learn through structured courses, exams, analytics,
                consistency tracking, friends ranking, and AI assistance.
              </p>
            </div>

            <div className="role-card teacher">
              <h3>Teachers</h3>
              <p>
                Create courses, add documents or videos, manage exams,
                analyze student performance, and grow your reach.
              </p>
            </div>

            <div className="role-card parent">
              <h3>Parents</h3>
              <p>
                Monitor progress, view analytics, teacher feedback,
                and student rankings — transparency without micromanaging.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
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

        {/* ---------- CALL TO ACTION ---------- */}
        <section className="final-cta">
          <h2>Start Your Learning Journey Today</h2>
          <p>No noise. No fake motivation. Just real progress.</p>
          <button className="btn primary large"><Link to={"/auth/register"} >Create your free account</Link></button>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} NeuraAcademy. All rights reserved.</p>
      </footer>
    </>
  );
}
