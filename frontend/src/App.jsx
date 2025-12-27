import Login from "./components/AuthForms/Login";
import Register from "./components/AuthForms/Register";
import AdminLogin from "./components/AuthForms/AdminLogin";
import {Routes , Route} from "react-router-dom";
import  ForgotPass  from  "./components/AuthForms/ForgotPass";
import  ResetPass  from "./components/AuthForms/ForgotPass";;
import  ConfirmEmail  from  "./components/AuthForms/ConfirmEmail";
import LandingPage from "./components/LandingPage"
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./components/Profile/StudentProfile";
import StudentProfileView from "./components/Profile/StudentProfileView";
import TeacherProfile from "./components/Profile/TeacherProfile";
import TeacherProfileView from "./components/Profile/TeacherProfileView";
import ParentProfile from "./components/Profile/ParentProfile";
import ParentProfileView from "./components/Profile/ParentProfileView";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import LinkChild from "./pages/parent/LinkChild";
import ParentRequests from "./pages/student/ParentRequests";
import CreateCourse from "./pages/teacher/course/CreateCourse";
import Chapters from "./pages/teacher/course/Chapters";
import Lessons from "./pages/teacher/course/Lessons";
import LessonContent from "./pages/teacher/course/LessonContent";
import Exams from "./pages/teacher/course/Exams";
import ExamBuilder from "./pages/teacher/course/ExamBuilder";
import CourseDashboard from "./pages/teacher/course/CourseDashboard";
import ExploreCourses from "./pages/student/ExploreCourses";
import CourseDetail from "./pages/student/CourseDetail";
import StudentLearning from "./pages/student/StudentLearning";
import StudentExams from "./pages/student/StudentExams";
import StudentFriends from "./pages/student/StudentFriends";
import StudentAnalytics from "./pages/student/StudentAnalytics";
import AttendExam from "./pages/student/AttendExam";
import ExamResult from "./pages/student/ExamResult";
import "./styles/teacher.css";


export default function App(){
    return(
        <>
            <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/student/dashboard" element={<StudentDashboard />}/>
                <Route path="/auth/register/student" element={<Register  role="student" />} />
                <Route path="/auth/register/teacher" element={<Register role="teacher"/>} />
                <Route path="/auth/register/parent" element={<Register role="parent"/>} />

                <Route path="/auth/login/student" element={<Login role="student" />} />
                <Route path="/auth/login/teacher" element={<Login role="teacher" />} />
                <Route path="/auth/login/parent" element={<Login role="parent" />} />
                <Route path="/auth/login/admin" element={<AdminLogin />} />

                <Route path="/auth/forgot_password" element={<ForgotPass />} />
                <Route path="/auth/reset_password/:token" element={<ResetPass />} />
                <Route path="/auth/confirm/:token" element={<ConfirmEmail />} />
                
                {/* Profile Setup / View Routes (Post-Login) */}
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
                {/* parent: form at /parent/profile, view at /parent/profile/view */}
                <Route path="/parent/profile" element={<ParentProfile />} />
                <Route path="/parent/profile/view" element={<ParentProfileView />} />
                
                {/* Profile View Routes (From Dashboard) */}
                <Route path="/student/profile/view" element={<StudentProfileView />} />
                <Route path="/teacher/profile/view" element={<TeacherProfileView />} />
                
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/parent/link-child" element={<LinkChild />} />
                <Route path="/student/parent-requests" element={<ParentRequests />} />

                {/* Student Routes */}
                <Route path="/student/explore" element={<ExploreCourses />} />
                <Route path="/student/course/:courseId" element={<CourseDetail />} />
                <Route path="/student/learn/:courseId" element={<StudentLearning />} />
                <Route path="/student/course/:courseId/exams" element={<StudentExams />} />
                <Route path="/student/friends" element={<StudentFriends />} />
                <Route path="/student/analytics" element={<StudentAnalytics />} />

                {/* Teacher Course Routes */}
                <Route path="/teacher/courses" element={<CreateCourse />} />
                <Route path="/teacher/course/:courseID/dashboard" element={<CourseDashboard />} />
                <Route path="/teacher/course/:courseID/chapters" element={<Chapters />} />
                <Route path="/teacher/course/:courseID/chapters/:chapterID/lessons" element={<Lessons />} />
                <Route path="/teacher/course/:courseID/chapters/:chapterID/lessons/:lessonID/content" element={<LessonContent />} />
                <Route path="/teacher/course/:courseID/exams" element={<Exams />} />
                <Route path="/teacher/course/:courseID/exams/:examID" element={<ExamBuilder />} />
                <Route path="/student/exams/:examID/attempt" element={<AttendExam />} />
                <Route path="/student/exams/:examID/result" element={<ExamResult />} />
            </Routes>

            
        </>
    )
}