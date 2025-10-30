// src/pages/instructor/changePassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios"; // from src/pages/instructor -> src/api is ../../api
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirm) {
      return setError("Please fill all fields");
    }
    if (newPassword !== confirm) {
      return setError("New password and confirmation do not match");
    }

    try {
      setLoading(true);

      // Call backend change-password route (protected)
      const res = await axios.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccessMsg(res.data?.message || "Password changed successfully.");

      // Optionally force re-login: logout and redirect to login
      // If your backend returns a new token/user, you could refresh auth instead.
      // Here we log the user out so they re-authenticate with the new password.
      setTimeout(() => {
        try {
          logout();
        } catch { /* ignore */ }
        navigate("/login");
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
        {user && <div className="text-sm text-gray-500 mb-4">Signed in as <strong>{user.email}</strong></div>}

        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        {successMsg && <div className="mb-3 text-green-600 text-sm">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? "Saving..." : "Change password"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
