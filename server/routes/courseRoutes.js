// server/routes/courseRoutes.js
import express from "express";
import {
  getAllCourses,
  getCourseById,
  enrollCourse,
  checkCourseAccess,
  syncCourseraCourses,
  updateCourse,
} from "../controllers/courseController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import Course from "../models/Course.js";

const router = express.Router();

/**
 * 🟢 Public routes
 */
router.get("/", getAllCourses);

/**
 * 🧠 Public course details
 */
router.get("/:id", getCourseById);

/**
 * 🧩 Admin-only routes
 */
router.post("/sync/coursera", protect, adminOnly, syncCourseraCourses);

/**
 * 🧠 Protected user routes
 */
router.post("/:id/enroll", protect, enrollCourse);
router.get("/:id/access", protect, checkCourseAccess);
router.put("/:id", protect, updateCourse);

/**
 * 📘 Get course content (protected)
 * This route delivers the course’s detailed structure, lessons, or materials
 */
router.get("/:id/content", protect, async (req, res) => {
  try {
    console.log("📘 Fetching course content for ID:", req.params.id);

    // Find the course by ID and populate instructor + optional modules
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      // If your schema doesn’t have modules or lessons, comment this out ↓
      .populate({
        path: "modules",
        populate: { path: "lessons" },
      })
      .lean();

    if (!course) {
      console.warn("⚠️ Course not found:", req.params.id);
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    console.log("✅ Course content fetched successfully:", course.title);
    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("❌ getCourseContent Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

export default router;
