import express from "express";
import {
  createCourse,
  updateCourse,
  publishCourse,
  getMyCourses,
} from "../controllers/instructorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("instructor"));

router.post("/courses", createCourse);
router.put("/courses/:courseId", updateCourse);
router.patch("/courses/:courseId/publish", publishCourse);
router.get("/my-courses", getMyCourses);

export default router;
