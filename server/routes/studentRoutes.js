import express from "express";
import {
  getAvailableCourses,   // ✅ newly added for /courses
  enrollInCourse,
  getEnrolledCourses,    // ✅ for /my-courses
  getCourseProgress,
  submitQuiz,
  generateCertificate,
} from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* ============================================================
   ✅ All student routes are protected & require "student" role
   ============================================================ */
router.use(protect, authorizeRoles("student"));

/* ============================================================
   📘 Course browsing & enrollment
   ============================================================ */

// 🔹 Get all available courses (student dashboard / browse page)
router.get("/courses", getAvailableCourses);

// 🔹 Get student's enrolled courses
router.get("/my-courses", getEnrolledCourses);

// 🔹 Enroll in a specific course
router.post("/enroll/:courseId", enrollInCourse);

/* ============================================================
   🧠 Learning progress & quizzes
   ============================================================ */

// 🔹 Get progress for a single course
router.get("/progress/:courseId", getCourseProgress);

// 🔹 Submit quiz answers
router.post("/quiz/:quizId/submit", submitQuiz);

/* ============================================================
   🎓 Certificate generation
   ============================================================ */

// 🔹 Generate a course completion certificate
router.post("/certificate/:courseId", generateCertificate);

/* ============================================================
   ✅ Export router
   ============================================================ */
export default router;
