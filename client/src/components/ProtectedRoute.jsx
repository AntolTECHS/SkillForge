// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Optional Loader component — replace or remove if you already use one
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-lg font-semibold text-gray-700">Loading...</div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until user auth state is loaded
  if (loading) {
    return <Loader />;
  }

  // If not logged in, redirect to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  // Admin-only check
  const isAdmin = user?.role === "admin" || user?.isAdmin;
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
