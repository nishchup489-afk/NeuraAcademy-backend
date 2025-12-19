import Login from "./Login";
import Register from "./Register";
import {Routes , Route} from "react-router-dom";
import  ForgotPass  from "./ForgotPass";
import  ResetPass  from "./ResetPass";
import  ConfirmEmail  from "./ConfirmEmail"

export default function App(){
    return(
        <>
            <Routes>
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/forgot_password" element={<ForgotPass />} />
                <Route path="/auth/reset_password/:token" element={<ResetPass />} />
                <Route path="/auth/confirm/:token" element={<ConfirmEmail />} />


            </Routes>

            
        </>
    )
}