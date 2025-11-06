// routes/instructorRoutes.js
import express from "express";
import {
  createCourse,
  updateCourse,
  publishCourse,
  getMyCourses,
  addModule,
  addLesson,
  addQuiz,
} from "../controllers/instructorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ✅ All instructor routes are protected and require the instructor role
router.use(protect, authorizeRoles("instructor"));

// 📘 Course management
router.post("/courses", createCourse);
router.put("/courses/:courseId", updateCourse);
router.post("/courses/:courseId/publish", publishCourse);
router.get("/my-courses", getMyCourses);

// 📦 Module & lesson management
router.post("/courses/:courseId/modules", addModule);
router.post("/modules/:moduleId/lessons", addLesson);

// 🧠 Quiz management
router.post("/courses/:courseId/quizzes", addQuiz);

export default router;
