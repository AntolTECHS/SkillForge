// server/controllers/enrollmentController.js
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

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
      started: false, // <--- add started field
      trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    });

    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to enroll" });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate("course");
    res.json({ enrollments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

// New: Start course
export const startCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    enrollment.started = true;
    await enrollment.save();

    res.json({ message: "Course started successfully", enrollment });
  } catch (err) {
    console.error("Start course error:", err);
    res.status(500).json({ message: "Server error starting course" });
  }
};
