import { useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../api/axios"



export default function ResetPass(){
    const { token } = useParams();
    const [form , setForm] = useState(
        {
            password : "" , 
            confirm_password : ""
        }
    )

    const handleChange = (e) => {
        setForm({...form , [e.target.name]:e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await api.post(`/auth/reset_password/${token}` , form
                
            )
            alert(res.data.message)
        }catch(err){
            console.error(err.response?.data || err.message)
        }

    }

    return (
        <>
          <h1>Reset your password</h1><br />
          <form onSubmit={handleSubmit}>
            <input type="password" placeholder="Enter new password" name="password" onChange={handleChange} required /><br />
            <input type="password" name="confirm_password" id="confirm_password" placeholder="Retype your password" onChange={handleChange} required />
            <button type="submit">Change password</button>
          </form>
        </>
    )
}