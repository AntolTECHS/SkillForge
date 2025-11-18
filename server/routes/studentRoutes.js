import express from "express";
import {
  getAvailableCourses,
  enrollInCourse,
  getEnrolledCourses,
  getCourseProgress,
  submitQuiz,
  generateCertificate,
  getDashboard, // ✅ new dashboard endpoint
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
   📊 Dashboard endpoint (new)
   ============================================================ */
router.get("/dashboard", getDashboard);

/* ============================================================
   🧠 Learning progress & quizzes
   ============================================================ */
router.get("/progress/:courseId", getCourseProgress);
router.post("/quiz/:quizId/submit", submitQuiz);

/* ============================================================
   🎓 Certificate generation
   ============================================================ */
router.post("/certificate/:courseId", generateCertificate);

export default router;
