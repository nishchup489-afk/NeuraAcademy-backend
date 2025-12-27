import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./ProfileView.css";

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
        action: "update",
        student_id: "",
    });

    const countryCodes = ["+1", "+44", "+91", "+61", "+81", "+880"];

    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            const file = files && files[0];
            setBaseform(prev => ({ ...prev, avatar: file }));
            if (file) {
                const url = URL.createObjectURL(file);
                setAvatarPreview(url);
            }
        } else {
            setBaseform(prev => ({ ...prev, [name]: value }));
        }
    };

    const parentHandleChange = (e) => {
        const { name, value } = e.target;
        setParentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const baseFormData = new FormData();
            Object.entries(baseform).forEach(([key, value]) => {
                if (value !== "" && value !== null) baseFormData.append(key, value);
            });

            await api.post("/student/profile", baseFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

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

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    return (
        <div className="profile-view-container">
            <div className="profile-view-content">
                <div className="profile-info-section" style={{padding: '2rem'}}>
                    <div className="profile-name-section">
                        <h2 className="profile-name">Set up your Parent Profile</h2>
                        <p className="profile-role">A few quick details to personalize your account</p>
                    </div>

                    <div className="profile-grid" style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start'}}>
                        <aside className="profile-sidebar">
                            <div className="avatar-card">
                                <div className="avatar-preview">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
                                    ) : (
                                        <div className="profile-avatar-placeholder" style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem'}}>
                                            {baseform.first_name?.charAt(0) || 'P'}{baseform.last_name?.charAt(0) || ''}
                                        </div>
                                    )}
                                </div>
                                <label className="upload-label" style={{marginTop: '0.75rem', display: 'block'}}>
                                    <input type="file" name="avatar" onChange={handleChange} style={{display: 'none'}} />
                                    <button type="button" className="edit-button" onClick={(e) => { e.currentTarget.previousElementSibling.click(); }} style={{width: '100%'}}>Choose Avatar</button>
                                </label>
                            </div>

                            <div style={{marginTop: '1rem', background: 'var(--light-bg)', padding: '1rem', borderRadius: '8px'}}>
                                <div style={{fontWeight: 700}}>{baseform.first_name || 'First'} {baseform.last_name || 'Last'}</div>
                                <div style={{color: 'var(--text-light)', marginTop: '0.25rem'}}>Parent • NeuraAcademy</div>
                                <div style={{marginTop: '0.75rem', fontSize: '0.95rem'}}>
                                    <div style={{marginBottom: '0.5rem'}}>Quick tips</div>
                                    <ul style={{margin: 0, paddingLeft: '1rem', color: 'var(--text-light)'}}>
                                        <li>Upload a clear avatar</li>
                                        <li>Provide at least one contact method</li>
                                    </ul>
                                </div>
                            </div>
                        </aside>

                        <form onSubmit={handleSubmit} className="profile-form" style={{display: 'grid', gap: '1rem'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="input-group">
                                    <label>First name</label>
                                    <input className="input" type="text" name="first_name" placeholder="First name" value={baseform.first_name} onChange={handleChange} />
                                </div>

                                <div className="input-group">
                                    <label>Last name</label>
                                    <input className="input" type="text" name="last_name" placeholder="Last name" value={baseform.last_name} onChange={handleChange} />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="input-group">
                                    <label>Date of birth</label>
                                    <input className="input" type="date" name="date_of_birth" value={baseform.date_of_birth} onChange={handleChange} />
                                </div>

                                <div className="input-group">
                                    <label>Country</label>
                                    <input className="input" type="text" name="country" placeholder="Country" value={baseform.country} onChange={handleChange} />
                                </div>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', alignItems: 'end'}}>
                                <div className="input-group">
                                    <label>Country code</label>
                                    <select className="input" name="country_code" value={baseform.country_code} onChange={handleChange}>
                                        {countryCodes.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Phone</label>
                                    <input className="input" type="tel" name="phone" placeholder="Phone number" value={baseform.phone} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Bio</label>
                                <textarea className="textarea" name="bio" placeholder="Short bio" value={baseform.bio} onChange={handleChange} />
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <input className="input" type="url" name="github" placeholder="Github" value={baseform.github} onChange={handleChange} />
                                <input className="input" type="url" name="linkedin" placeholder="LinkedIn" value={baseform.linkedin} onChange={handleChange} />
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <input className="input" type="url" name="facebook" placeholder="Facebook" value={baseform.facebook} onChange={handleChange} />
                                <input className="input" type="url" name="x" placeholder="X" value={baseform.x} onChange={handleChange} />
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div>
                                    <h3 style={{marginTop: 0}}>Parent Info</h3>
                                    <label>Parent code</label>
                                    <input className="input" type="text" name="parent_code" placeholder="Parent code" value={parentForm.parent_code} onChange={parentHandleChange} />

                                    <label style={{marginTop: '0.5rem'}}>Student ID to link (optional)</label>
                                    <input className="input" type="text" name="student_id" placeholder="Student ID" value={parentForm.student_id} onChange={parentHandleChange} />
                                </div>

                                <div>
                                    <label>Action</label>
                                    <select className="input" name="action" value={parentForm.action} onChange={parentHandleChange}>
                                        <option value="update">Update Profile</option>
                                        <option value="link_request">Request Student Link</option>
                                    </select>

                                    <div style={{marginTop: '1.5rem'}}>
                                        <button type="submit" className="edit-button" style={{width: '100%'}}>Save Profile</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
