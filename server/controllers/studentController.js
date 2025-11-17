// controllers/studentController.js
import Course from "../models/Course.js";
import User from "../models/User.js";

/* ============================================================
   📘 Get all available courses
   ============================================================ */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).select(
      "title description image instructor"
    );
    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Server error fetching courses." });
  }
};

/* ============================================================
   🧩 Enroll in course
   ============================================================ */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const user = await User.findById(req.user._id);

    const alreadyEnrolled = user.enrolledCourses.some(
      (c) => c.course.toString() === courseId.toString()
    );
    if (alreadyEnrolled)
      return res.status(400).json({ message: "Already enrolled" });

    user.addCourseEnrollment(courseId);
    await user.save();

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in ${course.title}.`,
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Error enrolling in course" });
  }
};

/* ============================================================
   🎓 Get user's enrolled courses (with lessons & quizzes)
   ============================================================ */
export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate(
        "enrolledCourses.course",
        "title description image instructor content quizzes"
      )
      .lean();

    const enrollments = user.enrolledCourses.map((c) => ({
      course: c.course, // now includes content & quizzes
      progress: c.progress,
      started: c.started,
      hasPaid: c.hasPaid,
      enrolledAt: c.enrolledAt,
    }));

    res.status(200).json({ success: true, enrollments });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Error fetching enrolled courses" });
  }
};

/* ============================================================
   📌 Update Course Progress
   ============================================================ */
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;

    const user = await User.findById(req.user._id);
    const result = await user.updateCourseProgress(courseId, progress);

    res.status(200).json({
      success: true,
      message: "Progress updated",
      progress: result.newProgress,
      xp: user.xp,
      badges: result.badges,
      xpGained: result.xpGained,
    });
  } catch (err) {
    console.error("Progress update error:", err);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

/* ============================================================
   📊 Dashboard
   ============================================================ */
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses.course", "title image instructor")
      .lean();

    const currentCourses = user.enrolledCourses.map((c) => ({
      id: c.course._id,
      title: c.course.title,
      instructor: c.course.instructor ?? "TBA",
      image: c.course.image ?? "",
      progress: c.progress ?? 0,
      started: c.started,
    }));

    const stats = {
      coursesCount: user.enrolledCourses.length,
      xp: user.xp ?? 0,
      badges: user.badges ?? [],
    };

    res.status(200).json({ stats, currentCourses });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

/* ============================================================
   🧠 Placeholder Quiz
   ============================================================ */
export const submitQuiz = async (req, res) => {
  res.status(200).json({ success: true, message: "Quiz submitted!" });
};

/* ============================================================
   🎓 Placeholder Certificate
   ============================================================ */
export const generateCertificate = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Certificate generated successfully!",
    certificateUrl: "/certificates/sample.pdf",
  });
};

/* ============================================================
   🟢 Open Course (first-time XP)
   ============================================================ */
export const openCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.user._id);

    const enrollment = user.enrolledCourses.find(
      (c) => c.course.toString() === courseId.toString()
    );
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    if (!enrollment.started) {
      enrollment.started = true;
      user.xp += 2;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Course opened",
        xp: user.xp,
        badges: user.badges,
      });
    }

    res.status(200).json({ success: true, message: "Course already opened" });
  } catch (err) {
    console.error("Open course error:", err);
    res.status(500).json({ message: "Failed to open course" });
  }
};
