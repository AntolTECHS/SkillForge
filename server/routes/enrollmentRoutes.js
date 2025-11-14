// server/routes/enrollmentRoutes.js
import express from "express";
import {
  createEnrollment,
  getEnrollments,
  startCourse,
  getAllEnrollments,
} from "../controllers/enrollmentController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/enrollments => create a new enrollment (student)
router.post("/", protect, createEnrollment);

// GET /api/enrollments => fetch student's enrollments
router.get("/", protect, getEnrollments);

// PATCH /api/enrollments/:courseId/start => mark course as started
router.patch("/:courseId/start", protect, startCourse);

// GET /api/admin/enrollments => fetch all enrollments (admin)
router.get("/admin/all", protect, adminOnly, getAllEnrollments);

export default router;
