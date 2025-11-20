import { useState, useEffect } from "react";
import axios from "axios";

const StudentRewards = () => {
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token"); // if auth required
        const res = await axios.get(`${API_URL}/api/student/dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const stats = res.data?.stats || {};
        setXp(stats.xp || 0);
        setBadges(stats.badges || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [API_URL]);

  const rewards = [
    { id: 1, title: "Level 1 Achiever", xp: 1000, badgeColor: "bg-yellow-400" },
    { id: 2, title: "Level 2 Scholar", xp: 2000, badgeColor: "bg-green-400" },
    { id: 3, title: "Level 3 Champion", xp: 3000, badgeColor: "bg-purple-500" },
  ];

  if (loading)
    return (
      <div className="p-6 text-xl font-semibold">Loading rewards...</div>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🏅 XP & Rewards</h1>
      <p className="text-gray-600 mb-6">
        XP is automatically awarded based on your course progress.
      </p>

      <h2 className="text-lg font-semibold mb-3">
        Your XP: <span className="text-blue-600">{xp}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const unlocked = xp >= reward.xp;

          return (
            <div
              key={reward.id}
              className={`p-6 rounded-2xl text-center border shadow transition ${
                unlocked
                  ? "bg-white border-green-400 shadow-lg"
                  : "bg-gray-100 border-gray-300 opacity-60"
              }`}
            >
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 ${
                  unlocked ? reward.badgeColor : "bg-gray-400"
                }`}
              >
                {reward.id}
              </div>

              <h2 className="text-xl font-semibold">{reward.title}</h2>
              <p className="text-gray-600">Requires: {reward.xp} XP</p>

              <p className="mt-2 text-sm font-medium">
                {unlocked ? (
                  <span className="text-green-600">Unlocked ✔</span>
                ) : (
                  <span className="text-red-500">{reward.xp - xp} XP needed</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentRewards;
