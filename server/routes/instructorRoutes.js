// routes/instructorRoutes.js

import express from "express";
import {
  createCourse,
  updateCourse,
  publishCourse,
  getMyCourses,
  getCourseById,
  addModule,
  addLesson,
  addQuiz,
  deleteCourse,
} from "../controllers/instructorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   🔒 Middleware Protection
   ========================================================= */
// ✅ All instructor routes are protected and require the instructor role
router.use(protect, authorizeRoles("instructor"));

/* =========================================================
   📘 Course Management
   ========================================================= */

// ➕ Create a new course
router.post("/courses", createCourse);

// ✏️ Update course details
router.put("/courses/:courseId", updateCourse);

// 🗑️ Delete a course (optional but often useful)
router.delete("/courses/:courseId", deleteCourse);

// 🚀 Publish or unpublish course
router.patch("/courses/:courseId/status", publishCourse);

// 👀 Get all courses belonging to the logged-in instructor
router.get("/my-courses", getMyCourses);

// 👁️ Get a specific course with details (modules, lessons, quizzes)
router.get("/courses/:courseId", getCourseById);

/* =========================================================
   📦 Module & Lesson Management
   ========================================================= */

// ➕ Add a new module to a course
router.post("/courses/:courseId/modules", addModule);

// ➕ Add a lesson under a specific module
router.post("/courses/:courseId/modules/:moduleId/lessons", addLesson);

/* =========================================================
   🧠 Quiz Management
   ========================================================= */

// ➕ Add a quiz under a specific module
router.post("/courses/:courseId/modules/:moduleId/quizzes", addQuiz);

/* =========================================================
   🧩 Export
   ========================================================= */
export default router;
