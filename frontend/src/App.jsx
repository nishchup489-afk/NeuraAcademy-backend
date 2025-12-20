import Login from "./Login";
import Register from "./Register";
import {Routes , Route} from "react-router-dom";
import  ForgotPass  from "./ForgotPass";
import  ResetPass  from "./ResetPass";
import  ConfirmEmail  from "./ConfirmEmail"
import LandingPage from "./LandingPage";
import StudentDashboard from "./StudentDashboard";
import ProfileSetUp from "./Profile";

export default function App(){
    return(
        <>
            <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/student/dashboard" element={<StudentDashboard />}/>
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/forgot_password" element={<ForgotPass />} />
                <Route path="/auth/reset_password/:token" element={<ResetPass />} />
                <Route path="/auth/confirm/:token" element={<ConfirmEmail />} />
                <Route path="/profile" element={<ProfileSetUp />} />
                


            </Routes>

            
        </>
    )
}