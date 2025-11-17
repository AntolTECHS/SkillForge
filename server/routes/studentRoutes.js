import express from "express";
import {
  getAvailableCourses,
  enrollInCourse,
  getEnrolledCourses,
  submitQuiz,
  generateCertificate,
  getDashboard,
  updateProgress, // ✅ new progress update endpoint
  openCourse,     // ✅ open course endpoint
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
router.get("/courses", getAvailableCourses);
router.get("/my-courses", getEnrolledCourses);
router.post("/enroll/:courseId", enrollInCourse);

/* ============================================================
   📊 Dashboard endpoint
   ============================================================ */
router.get("/dashboard", getDashboard);

/* ============================================================
   📌 Update course progress
   ============================================================ */
router.put("/progress/:courseId", updateProgress); // PUT instead of GET

/* ============================================================
   🟢 Open course (first-time XP)
   ============================================================ */
router.post("/open/:courseId", openCourse); // NEW endpoint

/* ============================================================
   🧠 Learning progress & quizzes
   ============================================================ */
router.post("/quiz/:quizId/submit", submitQuiz);

/* ============================================================
   🎓 Certificate generation
   ============================================================ */
router.post("/certificate/:courseId", generateCertificate);

export default router;
