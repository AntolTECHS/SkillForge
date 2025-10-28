// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-sm font-medium text-gray-700">
      Checking authentication…
    </div>
  </div>
);

const ProtectedRoute = ({
  children,
  adminOnly = false,
  instructorOnly = false,
  allowedRoles = null,
}) => {
  const { user, loading, firstLogin } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  // 🚪 Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.role === "admin" || user?.isAdmin;
  const isInstructor = user?.role === "instructor";

  // 🔒 Role restrictions
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (instructorOnly && !isInstructor) return <Navigate to="/" replace />;

  // ✅ Allowed roles array (optional)
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const matches = allowedRoles.includes(user?.role);
    if (!matches) return <Navigate to="/" replace />;
  }

  // 🟠 Redirect instructors on first login to password-change screen
  if (isInstructor && firstLogin && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
