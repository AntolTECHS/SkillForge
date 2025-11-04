import Course, { Quiz } from "../models/Course.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ============================================================
   ✅ Get all available courses (for browsing)
   ============================================================ */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Error fetching available courses:", error);
    res.status(500).json({ message: "Server error fetching available courses" });
  }
};

/* ============================================================
   ✅ Enroll in a course — starts 21-day free trial
   ============================================================ */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const student = await User.findById(studentId);

    const alreadyEnrolled = student.enrolledCourses.some(
      (c) => c.course.toString() === courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // ✅ Add course with trial expiration (21 days)
    student.addCourseEnrollment(courseId, 21);
    await student.save();

    // Create progress tracking
    await Progress.create({
      student: studentId,
      course: courseId,
      completedLessons: [],
      completionRate: 0,
    });

    res.status(200).json({
      success: true,
      message: "Enrolled successfully. 21-day free trial started!",
      trialEnds: student.enrolledCourses.find(
        (c) => c.course.toString() === courseId
      ).trialExpiresAt,
      course,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error enrolling in course" });
  }
};

/* ============================================================
   ✅ Get all enrolled courses
   ============================================================ */
export const getEnrolledCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate(
      "enrolledCourses.course"
    );

    // Auto-check trial expiry
    const currentDate = new Date();
    const courses = student.enrolledCourses.map((item) => {
      const isTrialExpired = item.trialExpiresAt && item.trialExpiresAt < currentDate;
      return {
        course: item.course,
        enrolledAt: item.enrolledAt,
        trialExpiresAt: item.trialExpiresAt,
        hasPaid: item.hasPaid,
        accessActive: item.hasPaid || !isTrialExpired,
      };
    });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Server error fetching enrolled courses" });
  }
};

/* ============================================================
   ✅ Verify course access (trial or paid)
   ============================================================ */
const verifyAccess = async (studentId, courseId) => {
  const student = await User.findById(studentId);
  const record = student.enrolledCourses.find(
    (c) => c.course.toString() === courseId
  );
  if (!record) return false;

  const now = new Date();
  if (record.hasPaid) return true;
  if (record.trialExpiresAt && record.trialExpiresAt > now) return true;

  return false;
};

/* ============================================================
   ✅ Submit quiz and calculate score
   ============================================================ */
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // check access
    const canAccess = await verifyAccess(studentId, quiz.course.toString());
    if (!canAccess)
      return res.status(403).json({ message: "Access expired — please make payment." });

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) score++;
    });

    const percentage = (score / quiz.questions.length) * 100;

    // Update progress
    const progress = await Progress.findOne({ student: studentId, course: quiz.course });
    if (progress) {
      progress.completedLessons.push(quiz.lesson);
      progress.completionRate = Math.min(
        (progress.completedLessons.length / quiz.totalLessons) * 100,
        100
      );
      await progress.save();
    }

    res.status(200).json({ success: true, score, percentage });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Server error submitting quiz" });
  }
};

/* ============================================================
   ✅ Get course progress — only if trial active or paid
   ============================================================ */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const canAccess = await verifyAccess(studentId, courseId);
    if (!canAccess) {
      return res.status(403).json({
        message: "Your trial has expired. Please complete payment to continue.",
      });
    }

    const progress = await Progress.findOne({
      course: courseId,
      student: studentId,
    }).populate("course", "title description");

    if (!progress)
      return res.status(404).json({ message: "Progress not found for this course" });

    res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Server error fetching progress" });
  }
};

/* ============================================================
   ✅ Generate certificate after completing course
   ============================================================ */
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const progress = await Progress.findOne({ course: courseId, student: studentId });
    if (!progress || progress.completionRate < 100) {
      return res
        .status(400)
        .json({ message: "Course not completed yet. Certificate unavailable." });
    }

    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      issuedDate: new Date(),
      certificateId: Math.random().toString(36).substring(2, 9).toUpperCase(),
    });

    await sendEmail({
      to: student.email,
      subject: `Certificate of Completion - ${course.title}`,
      text: `🎓 Congratulations ${student.name}! You’ve successfully completed ${course.title}. Certificate ID: ${certificate.certificateId}`,
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Server error generating certificate" });
  }
};
