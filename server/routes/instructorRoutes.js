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

const router = express.Router();

// =====================
// 👩‍🏫 Instructor Management Routes
// =====================

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

export default router;
