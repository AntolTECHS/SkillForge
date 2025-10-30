// server/routes/instructorRoutes.js
import express from "express";
import {
  addInstructor,
  getAllInstructors,
  deleteInstructor,
  getInstructorById,
  updateInstructor,
} from "../controllers/instructorController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import Course from "../models/Course.js";

const router = express.Router();

// ──────────────────────────────────────────────
// 👩‍🏫 Instructor Management Routes
// ──────────────────────────────────────────────

// ✅ Add new instructor (admin only)
router.post("/", protect, authorizeRoles("admin"), addInstructor);

// ✅ Get all instructors (admin only)
router.get("/", protect, authorizeRoles("admin"), getAllInstructors);

// ✅ Get a specific instructor by ID (admin or instructor)
router.get("/:id", protect, authorizeRoles("admin", "instructor"), getInstructorById);

// ✅ Update instructor profile (admin or the instructor themself)
router.put("/:id", protect, authorizeRoles("admin", "instructor"), updateInstructor);

// ✅ Delete instructor (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteInstructor);

// ──────────────────────────────────────────────
// 🎓 Instructor-Specific: Fetch Own Courses
// ──────────────────────────────────────────────
router.get(
  "/my-courses",
  protect,
  authorizeRoles("instructor", "admin"),
  async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.user._id })
        .populate("students", "name email")
        .populate("quizzes", "title")
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "Instructor courses fetched successfully",
        count: courses.length,
        courses,
      });
    } catch (error) {
      console.error("❌ Instructor Course Fetch Error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
