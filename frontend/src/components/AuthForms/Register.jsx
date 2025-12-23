import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";


export default function Register({role}){
    const navigate = useNavigate()
    const [form , setForm] = useState({
        email : "" , 
        username : "" , 
        password : "" , 
        confirm_password : "" , 
       })

    const  handleChange = (e) =>
    {
        setForm({...form ,  [e.target.name] : e.target.value  })
    }

    const handleSubmit = async (e) => 
    {
        e.preventDefault();

        try{
            const url = `/auth/register/${role}`
            console.log("FORM PAYLOAD:", form);
            const res = await api.post(url, form); 
            console.log(res.data)
            console.log("registered successfully")
            alert("registered successfully , check your email")
            navigate(`/auth/login/${role}`)



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