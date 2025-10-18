import express from "express";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  addQuizToCourse,
} from "../controllers/teacherController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("teacher"));

router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.get("/courses", getMyCourses);
router.post("/courses/:id/quiz", addQuizToCourse);

export default router;
