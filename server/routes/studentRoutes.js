import express from "express";
import {
  enrollInCourse,
  getEnrolledCourses,   // ✅ correct function name
  getCourseProgress,
  submitQuiz,
} from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all routes for students only
router.use(protect, authorizeRoles("student"));

// Routes
router.post("/enroll/:courseId", enrollInCourse);
router.get("/my-courses", getEnrolledCourses);  // ✅ updated
router.get("/progress/:courseId", getCourseProgress);
router.post("/quiz/:quizId/submit", submitQuiz);

export default router;
