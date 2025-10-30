import express from "express";
import {
  getAllCourses,
  getCourseById,
  syncCourseraCourses,
  updateCourse,
} from "../controllers/courseController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 🟢 Public: Anyone can view courses
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// 🔒 Protected: Only instructors can sync Coursera courses
router.get(
  "/sync/coursera",
  protect,
  authorizeRoles("instructor", "admin"),
  syncCourseraCourses
);

// 🔒 Protected: Only instructors or admins can update courses
router.put("/:id", protect, authorizeRoles("instructor", "admin"), updateCourse);

export default router;
