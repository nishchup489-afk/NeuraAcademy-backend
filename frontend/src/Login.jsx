import { useState } from "react";
import api from "./api/axios";
import {  Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
// import "./Login.css"

export default function Login(){
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
            const res = await api.post("/auth/login" , form)

            
        
            const role = res.data.user.role ;

        if (role === "student") 
            {
                 navigate("/student/dashboard"); 
            
            }else {
            
                console.log("No role found in response"); 
            }
        navigate("/profile")

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