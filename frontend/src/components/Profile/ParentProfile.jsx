import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ParentProfile() {
    const navigate = useNavigate();

    const [baseform, setBaseform] = useState({
        avatar: null,
        first_name: "",
        last_name: "",
        date_of_birth: "",
        country_code: "+1",
        country: "",
        phone: "",
        bio: "",
        github: "",
        facebook: "",
        x: "",
        linkedin: "",
        instagram: "",
    });

    const [parentForm, setParentForm] = useState({
        parent_code: "",
        action: "update",  // default action
        student_id: "",    // optional link request
    });

    const countryCodes = ["+1", "+44", "+91", "+61", "+81", "+880"];

    // Base form handler
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            setBaseform(prev => ({ ...prev, avatar: files[0] }));
        } else {
            setBaseform(prev => ({ ...prev, [name]: value }));
        }
    };

    // Parent form handler
    const parentHandleChange = (e) => {
        const { name, value } = e.target;
        setParentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Upload base profile info
            const baseFormData = new FormData();
            Object.entries(baseform).forEach(([key, value]) => {
                if (value !== "" && value !== null) baseFormData.append(key, value);
            });

            await api.post("/student/profile", baseFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            // Upload parent-specific info
            const parentFormData = new FormData();
            Object.entries(parentForm).forEach(([key, value]) => {
                if (value) parentFormData.append(key, value);
            });

            await api.post("/parent/profile", parentFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            navigate("/parent/dashboard");
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h3>Basic Info</h3>
                <label htmlFor="avatar">Upload your profile picture</label>
                <input type="file" name="avatar" id="avatar" onChange={handleChange} /><br />

                <input
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    value={baseform.first_name}
                    onChange={handleChange}
                /><br />

                <input
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    value={baseform.last_name}
                    onChange={handleChange}
                /><br />

                <input
                    type="date"
                    name="date_of_birth"
                    value={baseform.date_of_birth}
                    onChange={handleChange}
                /><br />

                <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={baseform.country}
                    onChange={handleChange}
                /><br />

                <label htmlFor="country_code">Country Code</label>
                <select
                    name="country_code"
                    value={baseform.country_code}
                    onChange={handleChange}
                >
                    {countryCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select><br />

                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    value={baseform.phone}
                    onChange={handleChange}
                /><br />

                <input
                    type="text"
                    name="bio"
                    placeholder="Bio"
                    value={baseform.bio}
                    onChange={handleChange}
                /><br />

                <input type="url" name="github" placeholder="Github" onChange={handleChange} /><br />
                <input type="url" name="facebook" placeholder="Facebook" onChange={handleChange} /><br />
                <input type="url" name="x" placeholder="X" onChange={handleChange} /><br />
                <input type="url" name="linkedin" placeholder="LinkedIn" onChange={handleChange} /><br />
                <input type="url" name="instagram" placeholder="Instagram" onChange={handleChange} /><br />

                <h3>Parent Info</h3>
                <input
                    type="text"
                    name="parent_code"
                    placeholder="Parent code"
                    value={parentForm.parent_code}
                    onChange={parentHandleChange}
                /><br />

                <input
                    type="text"
                    name="student_id"
                    placeholder="Student ID to link (optional)"
                    value={parentForm.student_id}
                    onChange={parentHandleChange}
                /><br />

                <select
                    name="action"
                    value={parentForm.action}
                    onChange={parentHandleChange}
                >
                    <option value="update">Update Profile</option>
                    <option value="link_request">Request Student Link</option>
                </select><br />

                <button type="submit">Submit Profile</button>
            </form>
        </>
    );
}
