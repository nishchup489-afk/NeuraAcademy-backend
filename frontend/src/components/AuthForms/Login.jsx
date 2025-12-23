import { useState } from "react";
import api from "../../api/axios";
import {  Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
// import "./Login.css"

export default function Login({role}){
    const navigate = useNavigate();

    const [form , setForm] = useState({
        email : "" , 
        password : ""
    })

    const handleChange = (e) => {
        setForm({...form , [e.target.name]:e.target.value})
        
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        

        try{
        const url = `/auth/login/${role}`;
        const res = await api.post(url, form);            
        const userRole = res.data.user.role

            
        
        const profileRes = await api.get("/auth/check_profile");
        const profileExists = profileRes.data.profile_exists;

        if (profileExists) {
            if (userRole === "student") navigate("/student/dashboard");
            if (userRole === "teacher") navigate("/teacher/dashboard");
            if (userRole === "parent") navigate("/parent/dashboard");
        } else {
            if (userRole === "student") navigate("/student/profile");
            if (userRole === "teacher") navigate("/teacher/profile");
            if (userRole === "parent") navigate("/parent/profile");
        }

        }
        catch(err){
            console.error(err.response?.data || err.message)
            console.log("error logging in")
        }




    }





    return (
        <>

        
         <h1>Login Form</h1> <br />
         <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} value={form.email} required /><br />
            <input type="password" name="password" placeholder="Enter your password" onChange={handleChange} required /><br />
            <button type="submit">Login</button>login

         </form>
         <div className="forgot_password">
            <Link to="/auth/forgot_password">forgot password</Link>
         </div>
        </>
    )
}