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

// PUBLIC PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// STUDENT PAGES
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentChat from "./pages/student/StudentChat";
import StudentSettings from "./pages/student/Settings";
import StudentRewards from "./pages/student/StudentRewards";
import CommunityPage from "./pages/student/Community";

// INSTRUCTOR PAGES
import InstructorLayout from "./pages/instructor/InstructorLayout";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import MyCourses from "./pages/instructor/MyCourses";
import CreateCourse from "./pages/instructor/CreateCourse";
import EditCourse from "./pages/instructor/EditCourse";
import Students from "./pages/instructor/Students";
import InstructorSettings from "./pages/instructor/Settings";
import ChangePassword from "./pages/instructor/changePassword";

// ADMIN PAGES
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCourses from "./pages/Admin/courses";
import AdminInstructors from "./pages/Admin/instructors";

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  // Hide navbar on specific routes
  const hideNavbar = ["/admin", "/student", "/instructor"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT ROUTES */}
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
          <Route path="settings" element={<StudentSettings />} />
          <Route path="rewards" element={<StudentRewards />} />
          <Route path="community" element={<CommunityPage />} />
        </Route>

        {/* INSTRUCTOR ROUTES */}
        <Route
          path="/instructor/*"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="course/edit/:courseId" element={<EditCourse />} />
          <Route path="students" element={<Students />} />
          <Route path="settings" element={<InstructorSettings />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/*"
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

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// ROOT
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
