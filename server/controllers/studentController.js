// controllers/studentController.js
import User from "../models/User.js";
import Course from "../models/Course.js";

/* ============================================================
   📘 Get all available courses
   ============================================================ */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).select("title description thumbnail instructor");
    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Server error fetching courses." });
  }
};

/* ============================================================
   🧩 Enroll in course (starts 21-day free trial)
   ============================================================ */
export const enrollInCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      (enrolled) => enrolled.course.toString() === courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Calculate trial expiry date (21 days)
    const now = new Date();
    const trialExpiresAt = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: now,
      trialExpiresAt,
      hasPaid: false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: `Enrolled in ${course.title} with a 21-day free trial.`,
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
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses.course", "title thumbnail description")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, enrollments: user.enrolledCourses });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Error fetching enrolled courses" });
  }
};

/* ============================================================
   📈 Get course progress (placeholder)
   ============================================================ */
export const getCourseProgress = async (req, res) => {
  // In future, connect to lesson progress model
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
