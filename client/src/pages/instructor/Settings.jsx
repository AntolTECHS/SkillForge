import React, { useState } from "react";
import { Bell, Moon } from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        {/* Profile Info */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                defaultValue="Alex Instructor"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                defaultValue="alex@skillforge.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <span>Enable email notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">
              {notifications ? "On" : "Off"}
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
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">
              {darkMode ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
