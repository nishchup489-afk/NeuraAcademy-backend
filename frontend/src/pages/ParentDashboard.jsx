import { Link } from "react-router-dom";

export default function ParentDashboard() {


  return (
    <>
      {/* HEADER */}
      <header style={styles.header}>
        <h2>NeuraAcademy</h2>

        <nav style={styles.nav}>
          <Link to="/parent/dashboard">Dashboard</Link>
          <Link to="/parent/child">Child Profile</Link>
          <Link to="/parent/progress">Progress</Link>
          <Link to="/parent/profile">Profile</Link>
          <Link to="/auth/logout">Logout</Link>
        </nav>
      </header>

      {/* MAIN */}
      <main style={styles.main}>
        <section style={styles.welcome}>
          <h1>Welcome 👋</h1>
          <p>Monitor your child’s learning and stay connected.</p>
        </section>

        {/* CHILD OVERVIEW */}
        <section style={styles.stats}>
          <div style={styles.card}>
            <h3>Linked Child</h3>
            <p>Not linked</p>
          </div>
          <div style={styles.card}>
            <h3>Courses Enrolled</h3>
            <p>0</p>
          </div>
          <div style={styles.card}>
            <h3>Attendance</h3>
            <p>—</p>
          </div>
        </section>

        {/* ACTIONS */}
        <section style={styles.actions}>
          <Link to="/parent/link-child" style={styles.actionBtn}>
            🔗 Link Child Account
          </Link>
          <Link to="/parent/messages" style={styles.actionBtn}>
            💬 Message Teachers
          </Link>
        </section>

        {/* INFO */}
        <section style={styles.info}>
          <h3>Parent Controls</h3>
          <ul>
            <li>View course progress</li>
            <li>Receive academic updates</li>
            <li>Communicate with teachers</li>
          </ul>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} NeuraAcademy
      </footer>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    borderBottom: "1px solid #ddd",
  },
  nav: {
    display: "flex",
    gap: "1.5rem",
  },
  main: {
    padding: "2rem",
  },
  welcome: {
    marginBottom: "2rem",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  card: {
    padding: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  actionBtn: {
    padding: "0.75rem 1.5rem",
    border: "1px solid black",
    borderRadius: "6px",
    textDecoration: "none",
    color: "black",
  },
  info: {
    borderTop: "1px solid #eee",
    paddingTop: "1.5rem",
  },
  footer: {
    textAlign: "center",
    padding: "1rem",
    borderTop: "1px solid #ddd",
    marginTop: "3rem",
  },
};
