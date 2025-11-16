// controllers/studentController.js
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

/* ============================================================
   📘 Get all available courses
   ============================================================ */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).select(
      "title description thumbnail instructor"
    );
    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Server error fetching courses." });
  }
};

/* ============================================================
   🧩 Enroll in course (creates Enrollment document)
   ============================================================ */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });
    if (existingEnrollment) return res.status(400).json({ message: "Already enrolled" });

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      hasPaid: false,
      started: false,
      trialExpiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21-day trial
      progress: 0,
    });

    res.status(201).json({
      success: true,
      message: `Enrolled in ${course.title} with a 21-day free trial.`,
      enrollment,
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Error enrolling in course" });
  }
};

/* ============================================================
   🎓 Get user's enrolled courses
   ============================================================ */
export const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title description thumbnail instructor")
      .lean();

    res.status(200).json({ success: true, enrollments });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Error fetching enrolled courses" });
  }
};

/* ============================================================
   📊 Get student dashboard stats (from Enrollment)
   ============================================================ */
export const getDashboard = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title thumbnail instructor")
      .lean();

    const currentCourses = enrollments.map((enroll) => ({
      id: enroll.course._id,
      title: enroll.course.title,
      instructor: enroll.course.instructor ?? "TBA",
      image: enroll.course.thumbnail ?? "",
      progress: enroll.progress ?? 0,
    }));

    // Get user for xp, badges, certificates
    const user = await User.findById(req.user._id).lean();

    const stats = {
      coursesCount: enrollments.length,
      xp: user?.xp ?? 0,
      certificatesCount: user?.certificates?.length ?? 0,
      badges: user?.badges ?? [],
    };

    res.status(200).json({ stats, currentCourses });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

/* ============================================================
   📈 Get course progress (placeholder)
   ============================================================ */
export const getCourseProgress = async (req, res) => {
  res.status(200).json({ success: true, progress: 0 });
};

/* ============================================================
   🧠 Submit quiz (placeholder)
   ============================================================ */
export const submitQuiz = async (req, res) => {
  res.status(200).json({ success: true, message: "Quiz submitted!" });
};

/* ============================================================
   🏅 Generate certificate (placeholder)
   ============================================================ */
export const generateCertificate = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Certificate generated successfully!",
    certificateUrl: "/certificates/sample.pdf",
  });
};
