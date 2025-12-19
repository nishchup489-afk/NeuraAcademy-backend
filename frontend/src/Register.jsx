import { useState } from "react";
import api from "./api/axios";

export default function Register(){
    const [form , setForm] = useState({
        email : "" , 
        username : "" , 
        password : "" , 
        confirm_password : ""
    })

    const  handleChange = (e) =>
    {
        setForm({...form ,  [e.target.name] : e.target.value  })
    }

    const handleSubmit = async (e) => 
    {
        e.preventDefault();

        try{
            const res = await api.post("/auth/register" , form)
            console.log(res.data)
            alert("registered successfully")
        }catch(err){
            console.error(err.response?.data || err.message)
            console.log("error logging in")
        }



    }


    return(
        <>
            <h1>Register</h1><br />
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" value={form.email} placeholder="Enter your email" onChange={handleChange} required /><br />
                <input type="text" name="username" placeholder="Enter a username" onChange={handleChange} required /><br />
                <input type="password" name="password" placeholder="Enter your password" onChange={handleChange} required /><br />
                <input type="password" name="confirm_password" placeholder="Confirm your password" onChange={handleChange} required /><br />

                <button type="submit">Register</button>



            </form>
        </>
    )
}