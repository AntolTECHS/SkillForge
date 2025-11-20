import React, { useEffect, useState } from "react";
import { Bell, Moon } from "lucide-react";
import axios from "axios";

const Settings = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://skillforge-75b5.onrender.com";

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    notifications: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pageFont = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const res = await axios.get(`${API_URL}/api/instructor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err?.response?.data || err.message);
        alert("Failed to load profile data. Check console for details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [API_URL]);

  // Update profile
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const res = await axios.put(`${API_URL}/api/instructor/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update profile:", err?.response?.data || err.message);
      alert("Failed to save profile changes. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-xl font-semibold" style={pageFont}>
        Loading profile...
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto" style={pageFont}>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        {/* Profile Info */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <span>Email notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={profile.notifications}
              onChange={() =>
                setProfile({ ...profile, notifications: !profile.notifications })
              }
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
            <span className="ml-3 text-sm text-gray-600">
              {profile.notifications ? "On" : "Off"}
            </span>
          </label>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-gray-600" />
            <span>Dark mode</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={profile.darkMode}
              onChange={() => setProfile({ ...profile, darkMode: !profile.darkMode })}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
            <span className="ml-3 text-sm text-gray-600">
              {profile.darkMode ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
