// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Loader shown while authentication/session is being validated
 */
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-sm font-medium text-gray-600 animate-pulse">
      Checking authentication…
    </div>
  </div>
);

/**
 * ProtectedRoute component
 * @param {ReactNode} children - Component(s) to render if authorized
 * @param {boolean} adminOnly - Only allow admin users
 * @param {boolean} instructorOnly - Only allow instructor users
 * @param {Array} allowedRoles - Array of allowed roles (overrides adminOnly/instructorOnly if provided)
 */
const ProtectedRoute = ({
  children,
  adminOnly = false,
  instructorOnly = false,
  allowedRoles = null,
}) => {
  const { user, loading, firstLogin } = useAuth();
  const location = useLocation();

  // Show loader while auth is validating
  if (loading) return <Loader />;

  // Not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role?.toLowerCase() || "";

  // Handle role restrictions
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";

  // Admin only
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  // Instructor only
  if (instructorOnly && !isInstructor) return <Navigate to="/" replace />;

  // Custom allowedRoles array
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());
    if (!normalizedRoles.includes(role)) return <Navigate to="/" replace />;
  }

  // Force instructors with firstLogin = true to change-password page
  if (isInstructor && firstLogin && location.pathname !== "/instructor/change-password") {
    return <Navigate to="/instructor/change-password" replace />;
  }

  // Authorized → render children
  return <>{children}</>;
};

export default ProtectedRoute;
