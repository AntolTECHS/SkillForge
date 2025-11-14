// server/controllers/enrollmentController.js
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// ============================================================
// 📌 Create a new enrollment
// ============================================================
export const createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      hasPaid: false,
      started: false,
      trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    });

    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    console.error("Enrollment creation error:", err);
    res.status(500).json({ message: "Failed to enroll" });
  }
};

// ============================================================
// 📌 Get current student's enrollments
// ============================================================
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("student", "name email")
      .populate("course", "title description");

    res.status(200).json({ success: true, enrollments });
  } catch (err) {
    console.error("Fetch enrollments error:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

// ============================================================
// 📌 Start a course
// ============================================================
export const startCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });

    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    enrollment.started = true;
    await enrollment.save();

    res.status(200).json({ success: true, message: "Course started successfully", enrollment });
  } catch (err) {
    console.error("Start course error:", err);
    res.status(500).json({ message: "Server error starting course" });
  }
};

// ============================================================
// 📌 Admin: get all enrollments with pagination
// ============================================================
export const getAllEnrollments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find()
        .populate("student", "name email") // ✅ correct field
        .populate("course", "title")
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      enrollments,
    });
  } catch (err) {
    console.error("Fetch all enrollments error:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};
