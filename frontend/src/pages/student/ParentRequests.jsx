import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ParentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/parent_requests");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const respond = async (id, action) => {
    setActionLoading(id);
    try {
      await api.post(`/student/parent_requests/${id}/respond`, { action });
      await fetchRequests();
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Parent Requests</h2>
      {requests.length === 0 && <div>No pending requests</div>}
      <ul>
        {requests.map(r => (
          <li key={r.id} style={{ marginBottom: 12 }}>
            <div><strong>From:</strong> {r.parent_name || r.parent_code}</div>
            <div><strong>Requested:</strong> {r.requested_at}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => respond(r.id, "approve")} disabled={actionLoading === r.id}>Approve</button>
              <button onClick={() => respond(r.id, "reject")} disabled={actionLoading === r.id} style={{ marginLeft: 8 }}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
