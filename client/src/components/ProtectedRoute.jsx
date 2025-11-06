// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Loader = () => (
  <div className="flex items-center justify-center py-10">
    <div className="text-sm font-medium text-gray-600 animate-pulse">
      Checking authentication…
    </div>
  </div>
);

/**
 * Role-aware route protection.
 * Supports adminOnly, instructorOnly, or a custom allowedRoles array.
 */
const ProtectedRoute = ({
  children,
  adminOnly = false,
  instructorOnly = false,
  allowedRoles = null,
}) => {
  const { user, loading, firstLogin } = useAuth();
  const location = useLocation();

  // 🕒 Wait until validation completes
  if (loading) return <Loader />;

  // 🚪 Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Normalize roles
  const role = user?.role?.toLowerCase?.() || "";
  const isAdmin = role === "admin" || user?.isAdmin;
  const isInstructor = role === "instructor";

  // 🔒 Role restrictions
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (instructorOnly && !isInstructor) return <Navigate to="/" replace />;

  // ✅ Handle allowedRoles array
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const matches = allowedRoles.some((r) => r.toLowerCase() === role);
    if (!matches) return <Navigate to="/" replace />;
  }

  // 🟠 Force instructors to change password on first login
  if (isInstructor && firstLogin && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // ✅ Authorized → render child components
  return <>{children}</>;
};

export default ProtectedRoute;
