import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enroll in a course (starts 21-day trial)
router.post("/:courseId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Prevent duplicate enrollment
    const already = user.enrolledCourses.find(
      (c) => c.course.toString() === courseId
    );
    if (already)
      return res.status(400).json({ message: "Already enrolled in this course" });

    // Add course with 21-day trial
    user.addCourseEnrollment(courseId);
    await user.save();

    res.status(201).json({
      message: "Enrolled successfully. You have 21 days of free access.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
