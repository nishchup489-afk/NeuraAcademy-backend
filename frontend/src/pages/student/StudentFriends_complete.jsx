import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Users, Plus, LogOut } from "lucide-react";

export default function StudentFriends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await api.get("/student/friends");
      setFriends(res.data.friends || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">NeuraAcademy</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/student/dashboard")} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Dashboard</button>
            <button onClick={() => { api.get("/auth/logout"); navigate("/"); }} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Friends & Network</h2>
          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <Plus size={18} /> Add Friend
          </button>
        </div>

        <div className="bg-white rounded-lg p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">Friends feature coming soon!</p>
          <p className="text-gray-500 mt-2">Connect with other learners and grow together</p>
        </div>
      </main>
    </div>
  );
}
