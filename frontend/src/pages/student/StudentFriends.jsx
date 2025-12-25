import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function StudentFriends() {
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addFriendId, setAddFriendId] = useState("");
  const [activeTab, setActiveTab] = useState("friends");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const friendsRes = await api.get("/student/friends");
      setFriends(friendsRes.data.friends || []);

      const leaderboardRes = await api.get("/student/leaderboard");
      setLeaderboard(leaderboardRes.data.leaderboard || []);

      const profileRes = await api.get("/student/profile");
      setUserProfile(profileRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!addFriendId.trim()) return;

    try {
      await api.post("/student/friends", { friend_id: addFriendId });
      setAddFriendId("");
      fetchData();
      alert("Friend added successfully!");
    } catch (error) {
      console.error("Error adding friend:", error);
      alert(
        error.response?.data?.error ||
          "Failed to add friend. Please check the ID."
      );
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Remove this friend?")) return;

    try {
      await api.delete(`/student/friends/${friendId}`);
      fetchData();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Friends & Community</h1>
          <p className="text-gray-600 mt-2">Connect with other learners and track progress</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "friends"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Friends
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "leaderboard"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* My Friends */}
        {activeTab === "friends" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Friend Card */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Add a Friend
              </h3>
              <form onSubmit={handleAddFriend} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter friend's Role ID (e.g., STU-xxx-xxx)"
                  value={addFriendId}
                  onChange={(e) => setAddFriendId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add Friend
                </button>
              </form>
            </div>

            {friends.length === 0 ? (
              <div className="lg:col-span-3 text-center py-12">
                <p className="text-gray-600 text-lg">
                  No friends yet. Add friends to compare progress!
                </p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  {/* Friend Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                        {friend.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">
                        {friend.name}
                      </h4>
                      <p className="text-sm text-gray-600">{friend.role_id}</p>
                    </div>
                  </div>

                  {/* Friend Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Courses</p>
                      <p className="font-bold text-gray-900">
                        {friend.enrolled_courses || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Score</p>
                      <p className="font-bold text-gray-900">
                        {friend.average_score || 0}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="w-full py-2 text-red-600 hover:text-red-800 font-medium transition"
                  >
                    Remove Friend
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No leaderboard data available
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Consistency
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((student, idx) => {
                    const isUser = student.id === userProfile?.id;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-gray-50 ${
                          isUser ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          <span
                            className={`px-3 py-1 rounded-full text-white font-bold ${
                              idx === 0
                                ? "bg-yellow-500"
                                : idx === 1
                                ? "bg-gray-400"
                                : idx === 2
                                ? "bg-orange-600"
                                : "bg-gray-600"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                {student.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name}{isUser && " (You)"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {student.role_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.enrolled_courses || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-bold text-gray-900">
                            {student.average_score || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    student.consistency_rate || 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {student.consistency_rate || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">
                          {student.points || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
