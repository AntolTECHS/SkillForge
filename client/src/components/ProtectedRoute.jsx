// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-sm font-medium text-gray-700">Checking authentication…</div>
  </div>
);

const ProtectedRoute = ({
  children,
  adminOnly = false,
  instructorOnly = false, // 👈 add this
  allowedRoles = null,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.role === "admin" || user?.isAdmin;
  const isInstructor = user?.role === "instructor";

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (instructorOnly && !isInstructor) return <Navigate to="/" replace />;

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const matches = allowedRoles.includes(user?.role);
    if (!matches) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
