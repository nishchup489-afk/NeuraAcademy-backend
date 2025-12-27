import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function LinkChild() {
  const [studentId, setStudentId] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const form = new FormData();
      form.append("parent_code", parentCode);
      form.append("student_id", studentId);
      form.append("action", "link_request");

      const res = await api.post("/parent/profile", form, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(res.data.message || "Request sent");
      setLoading(false);
      navigate("/parent/dashboard");
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Link Child Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Parent Code</label><br />
          <input value={parentCode} onChange={e => setParentCode(e.target.value)} required />
        </div>

        <div>
          <label>Student ID</label><br />
          <input value={studentId} onChange={e => setStudentId(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Link Request"}</button>
      </form>

      {message && <div style={{ marginTop: 12 }}>{String(message)}</div>}
    </div>
  );
}
