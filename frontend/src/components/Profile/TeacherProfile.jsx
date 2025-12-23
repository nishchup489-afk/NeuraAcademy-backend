import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function TeacherProfile(){

    const navigate = useNavigate()
    const [baseform , setBaseform] = useState({
        avatar: null,
        first_name: "",
        last_name: "",
        date_of_birth: "",
        country_code: "+1",
        country: "" ,
        phone: "",
        bio: "",
        github: "",
        facebook: "",
        x: "",
        linkedin: "",
        instagram: "",
        
    })
    const [form , setForm ] = useState({
            platform_name : "" , 
            education_info : "" ,
            years_experience : 0 , 


    }

    

    )

    const countryCodes = ["+1", "+44", "+91", "+61", "+81" , "+880"];

    const teacherhandleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
        ...prev,
        [name]: value
    }));
    };

    const handleChange = (e) => {
        const {name , value , files} = e.target;
        if (name === "avatar") {
            setBaseform(prev => ({ ...prev, avatar: files[0] }))
        }else{
            setBaseform(prev => ({ ...prev, [name]: value }))
        }

    }


   const handleSubmit = async (e) => {
    e.preventDefault();

   
    try{
         const baseformData = new FormData();
         Object.entries(baseform).forEach(([key , value]) => {
            if (value !== "" && value !== null){
                baseformData.append(key , value)
            }
         })

         await api.post("/student/profile" , baseformData , {
            headers: { "Content-Type": "multipart/form-data" } ,
            withCredentials: true
         })

         const teacherFormData = new FormData();
         Object.entries(form).forEach(([key , value]) => {
            teacherFormData.append(key , value)
         })

         await api.post("/teacher/profile" , teacherFormData , {
            headers : { "Content-Type" : "multipart/form-data"} ,
            withCredentials : true
         })

         navigate("/teacher/dashboard")

    }catch(err){
        console.error(err.response?.data || err.message)
    }

   }




    return (
        <>

            <form onSubmit={handleSubmit}>
                <h3>Basic info</h3><br />
                 <label htmlFor="avatar">Upload your profile picture</label>
                <input type="file" name="avatar" id="avatar" onChange={handleChange} /><br />

                <input
                type="text"
                name="first_name"
                id="first_name"
                placeholder="Enter your first name"
                value={baseform.first_name}
                onChange={handleChange}
                /><br />

                <input
                type="text"
                name="last_name"
                id="last_name"
                placeholder="Enter your last name"
                value={baseform.last_name}
                onChange={handleChange}
                /><br />

                <input
                type="date"
                name="date_of_birth"
                id="date_of_birth"
                value={baseform.date_of_birth}
                onChange={handleChange}
                /><br />

                <input
                type="country"
                name="country"
                id="country"
                value={baseform.country}
                onChange={handleChange}
                /><br />

                {/* COUNTRY CODE DROPDOWN */}
                <label htmlFor="country_code">Country Code</label>
                <select
                name="country_code"
                id="country_code"
                value={baseform.country_code}
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
                value={baseform.phone}
                onChange={handleChange}
                /><br />

                <input
                type="text"
                name="bio"
                id="bio"
                placeholder="Type your bio"
                value={baseform.bio}
                onChange={handleChange}
                /><br />

                <input type="url" name="github" placeholder="Add your github" onChange={handleChange} /><br />
                <input type="url" name="facebook" placeholder="Add your facebook" onChange={handleChange} /><br />
                <input type="url" name="x" placeholder="Add your x" onChange={handleChange} /><br />
                <input type="url" name="linkedin" placeholder="Add your linkedin" onChange={handleChange} /><br />
                <input type="url" name="instagram" placeholder="Add your instagram" onChange={handleChange} /><br />


                
                <h3>Teacher info</h3>
                        <input
                        type="text"
                        name="platform_name"
                        id="platform_name"
                        placeholder="Enter your platform name"
                        value={form.platform_name}
                        onChange={teacherhandleChange}
                        /><br />
 
                        <input
                        type="text"
                        name="education_info"
                        id="education_info"
                        placeholder="Enter your education_info"
                        value={form.education_info}
                        onChange={teacherhandleChange}
                        /><br />

                        <input
                            type="number"
                            name="years_experience"
                            id="years_experience"
                            placeholder="How many years of experience do you have"
                            value={form.years_experience}
                            onChange={teacherhandleChange}
                        /><br />

                        <button type="submit">Submit profile</button>
                        

            </form>

        </>
    )



}