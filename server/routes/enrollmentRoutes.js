// server/routes/enrollmentRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createEnrollment, getEnrollments, startCourse } from "../controllers/enrollmentController.js";

const router = express.Router();

// POST /api/enrollments => create a new enrollment
router.post("/", protect, createEnrollment);

// GET /api/enrollments => fetch student's enrollments
router.get("/", protect, getEnrollments);

// PATCH /api/enrollments/:courseId/start => mark course as started
router.patch("/:courseId/start", protect, startCourse);

export default router;
