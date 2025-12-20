import { useState } from "react"
import api from "./api/axios";
import { useNavigate } from "react-router-dom";

export default function ProfileSetUp(){
  const navigate = useNavigate()
    const [form , setForm] = useState({
        avatar: null,
        first_name: "",
        last_name: "",
        date_of_birth: "",
        country_code: "+1",
        phone: "",
        bio: "",
        github: "",
        facebook: "",
        x: "",
        linkedin: "",
        instagram: "",
    })

    const countryCodes = ["+1", "+44", "+91", "+61", "+81"];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData()

        for (let key in form){
            if (form[key]) formData.append(key , form[key])
        }

        try{
            const res = await api.post("/profile" , formData , {
                headers : {"Content-Type" : "multipart/form-data"}
            })
            console.log("profile updated" , res.data)
            const role = res.data.role
            if (role === "student") 
                {
                    navigate("/student/dashboard"); 
                
                }else {
                
                    console.log("No role found in response"); 
                }
        }catch(err){
            console.error(err.response?.data || err.message)
            console.log("failed uploading profile")
        }
    }

    const  handleChange = (e) =>{
        const {name , value , files} = e.target ; 
        if (name === "avatar"){
            setForm({...form , [name]:files[0]})
        } else{
            setForm({...form , [name]:value})
        }

    }



    return(
       <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="avatar">Upload your profile picture</label>
        <input type="file" name="avatar" id="avatar" onChange={handleChange} /><br />

        <input
          type="text"
          name="first_name"
          id="first_name"
          placeholder="Enter your first name"
          value={form.first_name}
          onChange={handleChange}
        /><br />

        <input
          type="text"
          name="last_name"
          id="last_name"
          placeholder="Enter your last name"
          value={form.last_name}
          onChange={handleChange}
        /><br />

        <input
          type="date"
          name="date_of_birth"
          id="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
        /><br />

        {/* COUNTRY CODE DROPDOWN */}
        <label htmlFor="country_code">Country Code</label>
        <select
          name="country_code"
          id="country_code"
          value={form.country_code}
          onChange={handleChange}
        >
          {countryCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select><br />

        <input
          type="tel"
          name="phone"
          id="phone"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
        /><br />

        <input
          type="text"
          name="bio"
          id="bio"
          placeholder="Type your bio"
          value={form.bio}
          onChange={handleChange}
        /><br />

        <input type="url" name="github" placeholder="Add your github" onChange={handleChange} /><br />
        <input type="url" name="facebook" placeholder="Add your facebook" onChange={handleChange} /><br />
        <input type="url" name="x" placeholder="Add your x" onChange={handleChange} /><br />
        <input type="url" name="linkedin" placeholder="Add your linkedin" onChange={handleChange} /><br />
        <input type="url" name="instagram" placeholder="Add your instagram" onChange={handleChange} /><br />

        <button type="submit">Save Profile</button>
      </form>
    </>
    )
}