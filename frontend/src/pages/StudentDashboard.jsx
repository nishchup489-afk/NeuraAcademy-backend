import { useState , useEffect } from "react";
import api from "../api/axios";


export default function StudentDashboard() {

  const [dashboard , setDashboard] = useState(null)

  useEffect(() => {

    const fetchDashboard = async () => {
      try{
        const res = await api.get("/student/dashboard")
        setDashboard(res.data)
      }catch(err){
        console.error(err.response?.data || err.message)
     }

    }

    fetchDashboard();

  } , [])

  if (!dashboard){
    return <p>Loading...</p>
  }

  return (
   <>
      <style>{`
        /* ======= GLOBAL ======= */
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background-color: #f3f4f6; }

        /* ======= HEADER ======= */
        .dashboard-header { background: #4f46e5; color: #fff; padding: 1rem 2rem; }
        .dashboard-nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: bold; font-size: 1.5rem; }
        .search-bar { padding: 0.5rem 1rem; border-radius: 6px; border: none; width: 200px; }
        .profile-icon { font-size: 1.5rem; }

        /* ======= MAIN LAYOUT ======= */
        .dashboard-main { display: flex; min-height: calc(100vh - 60px); }
        .dashboard-sidebar { width: 220px; background: #fff; padding: 1rem; box-shadow: 2px 0 6px rgba(0,0,0,0.05); }
        .dashboard-sidebar ul { list-style: none; }
        .dashboard-sidebar li { padding: 0.75rem 0; cursor: pointer; border-radius: 6px; transition: background 0.2s; }
        .dashboard-sidebar li.active, .dashboard-sidebar li:hover { background: #e0e7ff; }

        .dashboard-content { flex: 1; padding: 2rem; background: #f7f7f7; overflow-y: auto; }

        /* ======= OVERVIEW CARDS ======= */
        .overview-cards { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .card { background: #fff; padding: 1rem 1.5rem; border-radius: 10px; flex: 1; min-width: 150px; box-shadow: 0 3px 8px rgba(0,0,0,0.05); }

        /* ======= MY COURSES ======= */
        .my-courses { margin-bottom: 2rem; }
        .courses-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
        .course-card { background: #fff; padding: 1rem 1.5rem; border-radius: 10px; width: 200px; box-shadow: 0 3px 8px rgba(0,0,0,0.05); }
        .course-card h4 { margin-bottom: 0.5rem; }
        .btn.primary { background: #4f46e5; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 0.5rem; }
        .btn.primary:hover { background: #4338ca; }

        /* ======= ALERTS ======= */
        .dashboard-alerts ul { list-style: none; padding-left: 1rem; }
        .dashboard-alerts li { background: #fff; padding: 0.5rem 1rem; margin-bottom: 0.5rem; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

        /* ======= FOOTER ======= */
        .dashboard-footer { text-align: center; padding: 1rem; background: #fff; margin-top: 1rem; box-shadow: 0 -2px 6px rgba(0,0,0,0.05); }
      `}</style>

      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <div className="logo">NeuraAcademy</div>
          <input type="text" placeholder="Search courses..." className="search-bar" />
          <div className="profile-icon">👤</div>
        </nav>
      </header>

      <main className="dashboard-main">
        <aside className="dashboard-sidebar">
          <ul>
            <li className="active">🏠 Dashboard</li>
            <li>📚 My Courses</li>
            <li>📝 Exams</li>
            <li>📊 Analytics</li>
            <li>👥 Friends</li>
            <li>💬 Messages</li>
            <li>🤖 Neura AI</li>
            <li>⚙️ Settings</li>
          </ul>
        </aside>

        <section className="dashboard-content">
          <div className="overview-cards">
            <div className="card">
              <h3>Active Courses</h3>
              <p>{dashboard.active_courses}</p>
            </div>
            <div className="card">
              <h3>Consistency</h3>
              <p>{dashboard.consistency}%</p>
            </div>
            <div className="card">
              <h3>Avg Score</h3>
              <p>{dashboard.avg_score}%</p>
            </div>
            <div className="card">
              <h3>Global Rank</h3>
              <p>#{dashboard.global_rank}</p>
            </div>
          </div>

          <section className="my-courses">
            <h2>Continue Learning</h2>
            <div className="courses-grid">
              {dashboard.courses.map((course, idx) => (
                <div className="course-card" key={idx}>
                  <h4>{course.title}</h4>
                  <p>Progress: {course.progress}%</p>
                  <button className="btn primary">Resume</button>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-alerts">
            <h2>Upcoming</h2>
            <ul>
              {dashboard.upcoming.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© NeuraAcademy</p>
      </footer>
    </>
  );
}
