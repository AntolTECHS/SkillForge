// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// ==================== Auth pages ====================
import Login from "./pages/Login";
import Register from "./pages/Register";

// ==================== Student pages / layout ====================
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentChat from "./pages/student/StudentChat";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentRewards from "./pages/student/StudentRewards";
import CommunityPage from "./pages/student/Community";

// ==================== Instructor pages ====================
import InstructorDashboard from "./pages/instructor/instructorDashboard";
import ChangePassword from "./pages/instructor/changePassword";
import CreateCourse from "./pages/instructor/CreateCourse";

// ==================== Admin pages ====================
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCourses from "./pages/Admin/courses";
import AdminInstructors from "./pages/Admin/instructors";

// ==================== Payment success ====================
import PaymentSuccess from "./pages/PaymentSuccess";

// ============================================================
// Layout Wrapper
// ============================================================
function AppLayout() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Hide Navbar on internal dashboards
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/instructor");

  // Determine default redirect after login
  const defaultRedirect = user?.role === "instructor"
    ? "/instructor"
    : user?.role === "admin"
    ? "/admin"
    : "/student/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Default redirect depending on user role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={defaultRedirect} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==================== STUDENT ROUTES ==================== */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="rewards" element={<StudentRewards />} />
          <Route path="community" element={<CommunityPage />} />
        </Route>

        {/* ==================== INSTRUCTOR ROUTES ==================== */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute instructorOnly>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/create-course"
          element={
            <ProtectedRoute instructorOnly>
              <CreateCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/change-password"
          element={
            <ProtectedRoute instructorOnly>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute adminOnly>
              <AdminCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructors"
          element={
            <ProtectedRoute adminOnly>
              <AdminInstructors />
            </ProtectedRoute>
          }
        />

        {/* ==================== PAYMENT SUCCESS ==================== */}
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// ============================================================
// App Root
// ============================================================
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AppLayout />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}
