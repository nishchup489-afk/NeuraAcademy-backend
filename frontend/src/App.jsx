import Login from "./components/AuthForms/Login";
import Register from "./components/AuthForms/Register";
import {Routes , Route} from "react-router-dom";
import  ForgotPass  from  "./components/AuthForms/ForgotPass";
import  ResetPass  from "./components/AuthForms/ForgotPass";;
import  ConfirmEmail  from  "./components/AuthForms/ConfirmEmail";
import LandingPage from "./components/LandingPage"
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./components/Profile/StudentProfile";
import TeacherProfile from "./components/Profile/TeacherProfile";
import ParentProfile from "./components/Profile/ParentProfile";


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
                <Route path="/auth/login/admin" element={<Login role="admin" />} />

                <Route path="/auth/forgot_password" element={<ForgotPass />} />
                <Route path="/auth/reset_password/:token" element={<ResetPass />} />
                <Route path="/auth/confirm/:token" element={<ConfirmEmail />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
                <Route path="/parent/profile" element={<ParentProfile />} />

                


            </Routes>

            
        </>
    )
}