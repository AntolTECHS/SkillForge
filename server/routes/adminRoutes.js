// server/routes/adminRoutes.js
import express from "express";
import {
  addInstructor,
  getAllUsers,
  getAllInstructors,
  deleteUser,
  deleteInstructor,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ✅ Protect all admin routes
router.use(protect, authorizeRoles("admin"));

// =====================
// 👩‍🏫 Instructor Management
// =====================
router.post("/instructors", addInstructor);
router.get("/instructors", getAllInstructors);
router.delete("/instructors/:id", deleteInstructor);

// =====================
// 👥 User Management
// =====================
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// =====================
// 📊 Admin Dashboard Mock Data
// =====================
router.get("/overview", (req, res) => {
  res.json({
    users: 142,
    instructors: 8,
    courses: 24,
    enrollments: 310,
    revenue: 52750,
  });
});

router.get("/courses", (req, res) => {
  res.json([
    { id: 1, title: "React Mastery", category: "Web Development" },
    { id: 2, title: "Python Fundamentals", category: "Programming" },
  ]);
});

router.get("/enrollments", (req, res) => {
  res.json([
    { id: 1, user: "Alice", course: "React Mastery" },
    { id: 2, user: "Bob", course: "Python Fundamentals" },
  ]);
});

// ✅ Handle DELETE enrollments (mock)
router.delete("/enrollments/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Mock delete enrollment ${id}`);
  res.status(200).json({ message: `Enrollment ${id} deleted successfully` });
});

// =====================
// 💳 Payments & Misc
// =====================
router.get("/attendance", (req, res) => res.json([]));
router.get("/assignments", (req, res) => res.json([]));
router.get("/payments", (req, res) =>
  res.json([
    { id: 1, user: "Alice", amount: 150, date: "2025-10-20" },
    { id: 2, user: "Bob", amount: 100, date: "2025-10-22" },
  ])
);
router.get("/certificates", (req, res) => res.json([]));

export default router;
