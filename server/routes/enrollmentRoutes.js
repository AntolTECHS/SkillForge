// server/routes/enrollmentRoutes.js

import express from "express";
import Enrollment from "../models/Enrollment.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @desc Get all enrollments (public/instructor use)
 * @route GET /api/enrollments
 * @access Protected (students/instructors/admin)
 */
router.get("/", protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

    const enrollments = await Enrollment.find()
      .populate("user", "name email role")
      .populate("course", "title category")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ total: enrollments.length, enrollments });
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error.message);
    res.status(500).json({ message: "Server error while fetching enrollments" });
  }
});

export default router;
