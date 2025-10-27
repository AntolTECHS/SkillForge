// server/routes/adminRoutes.js
import express from "express";
import {
  addInstructor,
  getAllUsers,
  getAllInstructors,
  deleteUser,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ✅ Protect all routes — only admin users can access
router.use(protect, authorizeRoles("admin"));

// =====================
// 👩‍🏫 Instructor Management
// =====================

// Add a new instructor
router.post("/instructors", addInstructor);

// Get all instructors
router.get("/instructors", getAllInstructors);

// =====================
// 👥 User Management
// =====================

// Get all users
router.get("/users", getAllUsers);

// Delete a user
router.delete("/user/:id", deleteUser);

// =====================
// 📊 Admin Dashboard Mock Data (frontend integration)
// =====================

// Overview summary
router.get("/overview", (req, res) => {
  res.json({
    users: 142,
    instructors: 8,
    courses: 24,
    enrollments: 310,
    revenue: 52750,
  });
});

// Courses
router.get("/courses", (req, res) => {
  res.json([
    { id: 1, title: "React Mastery", category: "Web Development" },
    { id: 2, title: "Python Fundamentals", category: "Programming" },
  ]);
});

// Enrollments
router.get("/enrollments", (req, res) => {
  res.json([
    { id: 1, user: "Alice", course: "React Mastery" },
    { id: 2, user: "Bob", course: "Python Fundamentals" },
  ]);
});

// Attendance
router.get("/attendance", (req, res) => {
  res.json([]);
});

// Assignments
router.get("/assignments", (req, res) => {
  res.json([]);
});

// Payments
router.get("/payments", (req, res) => {
  res.json([
    { id: 1, user: "Alice", amount: 150, date: "2025-10-20" },
    { id: 2, user: "Bob", amount: 100, date: "2025-10-22" },
  ]);
});

// Certificates
router.get("/certificates", (req, res) => {
  res.json([]);
});

export default router;
