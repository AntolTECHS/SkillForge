// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import PaymentSuccess from "./pages/PaymentSuccess";

// User dashboard
import Dashboard from "./pages/Dashboard";

// Instructor pages
import InstructorDashboard from "./pages/instructor/instructorDashboard";
import ChangePassword from "./pages/instructor/changePassword";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCourses from "./pages/Admin/courses";
import AdminInstructors from "./pages/Admin/instructors";

function AppLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin"); // hide navbar for admin pages

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* Protected User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/change-password"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminInstructors />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}
