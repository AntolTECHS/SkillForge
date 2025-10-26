// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Small centered loader (non-fullscreen so it works in panels) */
const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-sm font-medium text-gray-700">Checking authentication…</div>
  </div>
);

/**
 * ProtectedRoute
 * - adminOnly (boolean): legacy convenience flag (keeps your current usage)
 * - allowedRoles (array): e.g. ['admin','instructor'] preferred for explicit role rules
 *
 * Usage:
 * <ProtectedRoute adminOnly><AdminPanel/></ProtectedRoute>
 * or
 * <ProtectedRoute allowedRoles={['admin','instructor']}><Panel/></ProtectedRoute>
 */
const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  // Not authenticated -> send to login, preserve original location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role checks
  const isAdmin = user?.role === "admin" || user?.isAdmin;
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const matches = allowedRoles.includes(user?.role);
    if (!matches) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
