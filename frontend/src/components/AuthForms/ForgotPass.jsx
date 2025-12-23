import { useState } from "react";
import api from "../../api/axios";

export default function ForgotPass(){
    const [email , setEmail] = useState("")
    const [message , setMessage] = useState("")

    const handleChange = (e) => 
    {
        setEmail(e.target.value)
    }

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        try{
            const res = await api.post("/auth/forgot_password" , {email})
            setMessage(res.data.message)
        }catch(err){
            setMessage(err.response?.data?.message || err.message)
        }
    }


    return (
        <>
            <h1>Forgot password</h1><br />
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" id="email" placeholder="Enter your Email" onChange={handleChange} value={email} required /><br />
                <button type="submit">Send verification link</button>
            </form>

            <div className="message">
                {message}
            </div>
        </>
    )
}