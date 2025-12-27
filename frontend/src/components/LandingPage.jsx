import { Link } from "react-router-dom";
import {  useRef } from "react";
// import gsap from "gsap";
import {
  GraduationCap,
  Users,
  BarChart3,
  Bot,
  BookOpen,
  ShieldCheck,
  LineChart,
  Youtube,
  PenTool,
  UserCheck,
  Mail,
  ExternalLink,
  Settings,
} from "lucide-react";

export default function LandingPage() {
  const heroTextRef = useRef(null);

  // useEffect(() => {
  //   gsap.from(heroTextRef.current, {
  //     opacity: 0,
  //     y: 40,
  //     duration: 1,
  //     ease: "power3.out",
  //   });
  // }, []);

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            NeuraAcademy
          </div>

          <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
            <a href="#roles" className="hover:text-indigo-600">Roles</a>
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#neurallearn" className="hover:text-indigo-600">NeuralLearn</a>
            <a href="#about" className="hover:text-indigo-600">About</a>
          </nav>

          <div className="hidden md:flex gap-3 items-center">
            <Link to="/auth/login/student" className="px-4 py-2 border rounded-md text-indigo-600 hover:bg-indigo-50">Student Login</Link>
            <Link to="/auth/login/teacher" className="px-4 py-2 border rounded-md text-indigo-600 hover:bg-indigo-50">Teacher Login</Link>
            <Link to="/auth/login/parent" className="px-4 py-2 border rounded-md text-indigo-600 hover:bg-indigo-50">Parent Login</Link>
            <a href="#roles" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Register</a>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 py-20 items-center">
          {/* Text */}
          <div ref={heroTextRef} className="space-y-6">
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight text-indigo-900">
              Learn Smarter.<br />
              Teach Better.<br />
              Track Everything.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              NeuraAcademy is a modern education platform for students, teachers,
              and parents — focused on consistency, analytics, and clarity.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link to="/auth/register/student" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow">
                Start Learning
              </Link>
              <a href="#roles" className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg">
                See How It Works
              </a>
            </div>
          </div>

          {/* Fixed Visual */}
          <div className="relative">
            <img
              src="/images/hero1.png"
              alt="NeuraAcademy Dashboard"
              className="w-full max-w-xl mx-auto object-contain drop-shadow-2xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section id="roles" className="py-24 bg-white">
        <h2 className="text-4xl font-extrabold text-center mb-14">
          Built for Everyone in Education
        </h2>

        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4 px-6">
          {/* Student */}
          <RoleCard
            icon={<GraduationCap />}
            title="Students"
            items={[
              "Explore structured courses",
              "Exclusive lesson rooms",
              "Consistency tracking & analytics",
              "Leaderboard & friends ranking",
              "Interactive bots & embedded Wikipedia",
            ]}
          />

          {/* Teacher */}
          <RoleCard
            icon={<PenTool />}
            title="Teachers"
            items={[
              "Create courses in your own environment",
              "Embed YouTube classes easily",
              "Rich Tiptap editor",
              "Course analytics & exams system",
            ]}
          />

          {/* Parent */}
          <RoleCard
            icon={<Users />}
            title="Parents"
            items={[
              "Link with your children",
              "Track progress & performance",
              "Online supervision & insights",
            ]}
          />

          {/* Admin */}
          <RoleCard
            icon={<Settings />}
            title="Admin"
            items={[
              "Full platform control",
              "Advanced analytics & reports",
              "Contact: Nishchup",
              "Mail: nishchup489@gmail.com",
            ]}
          />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 bg-gray-50">
        <h2 className="text-4xl font-extrabold text-center mb-14">
          Platform Highlights
        </h2>

        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 px-6">
          <Feature icon={<BarChart3 />} title="Deep Analytics" />
          <Feature icon={<Bot />} title="AI Assistance & Bots" />
          <Feature icon={<BookOpen />} title="Structured Learning Flow" />
          <Feature icon={<LineChart />} title="Consistency Tracking" />
          <Feature icon={<ShieldCheck />} title="Secure Authentication" />
          <Feature icon={<Youtube />} title="Embedded Video Classes" />
        </div>

        <p className="text-center text-gray-500 mt-10 max-w-3xl mx-auto">
          Secure login system with encrypted databases. No shortcuts. No fake claims.
          Security is implemented using industry-standard practices.
        </p>
      </section>

      {/* ================= NEURALLEARN ================= */}
      <section id="neurallearn" className="py-24 bg-white text-center">
        <h2 className="text-4xl font-extrabold mb-6">NeuralLearn</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8">
          NeuralLearn is our future flagship vision. NeuraAcademy is an MVP
          prototype designed to test ideas, architecture, and real usage.
        </p>

        <a
          href="https://neurallearndocs.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg"
        >
          Read NeuralLearn Docs <ExternalLink size={18} />
        </a>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-extrabold mb-6">About Us</h2>
          <p className="text-gray-600 mb-4">
            MVP Project created by <strong>Sadnan Nishthup</strong>.
          </p>
          <p className="text-gray-600 mb-10">
            This project is an early prototype of our future platform —
            <strong> NeuralLearn</strong>.
          </p>

          {/* Mail Box */}
          <form
            action="mailto:nishchup489@gmail.com"
            method="POST"
            encType="text/plain"
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <input
              type="text"
              name="message"
              placeholder="Have an idea? Want to join?"
              className="px-4 py-3 border rounded-lg w-full md:w-96"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg"
            >
              Send <Mail size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-6 text-center text-gray-400 border-t">
        © {new Date().getFullYear()} NeuraAcademy. Prototype build.
      </footer>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function RoleCard({ icon, title, items }) {
  return (
    <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-4 text-indigo-600">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2 text-gray-600 text-sm">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
      <div className="mt-4 flex gap-3">
        {(() => {
          const t = title.toLowerCase();
          const role = t.includes('student') ? 'student' : t.includes('teacher') ? 'teacher' : t.includes('parent') ? 'parent' : 'admin';
          if (role === 'admin') {
            return (
              <Link to={`/auth/login/${role}`} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Admin Login</Link>
            );
          }

          return (
            <>
              <Link to={`/auth/login/${role}`} className="px-4 py-2 border rounded-md text-indigo-600">{title.slice(0, -1)} Login</Link>
              <Link to={`/auth/register/${role}`} className="px-4 py-2 bg-indigo-600 text-white rounded-md">{title.slice(0, -1)} Register</Link>
            </>
          );
        })()}
      </div>
    </div>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
      <div className="flex justify-center mb-3 text-indigo-600">
        {icon}
      </div>
      <h4 className="font-semibold">{title}</h4>
    </div>
  );
}
