import Course from "../models/Course.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Quiz from "../models/Quiz.js";
import Certificate from "../models/Certificate.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const student = await User.findById(studentId);
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    student.enrolledCourses.push(courseId);
    await student.save();

    // Initialize progress tracking
    await Progress.create({
      student: studentId,
      course: courseId,
      completedLessons: [],
      completionRate: 0,
    });

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error enrolling in course" });
  }
};

// ✅ Get all enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate("enrolledCourses");
    res.status(200).json({
      success: true,
      courses: student.enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Server error fetching enrolled courses" });
  }
};

// ✅ Submit quiz and calculate score
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) score++;
    });

    const percentage = (score / quiz.questions.length) * 100;

    // Update student's progress
    const progress = await Progress.findOne({
      student: studentId,
      course: quiz.course,
    });

    if (progress) {
      progress.completedLessons.push(quiz.lesson);
      progress.completionRate = Math.min(
        (progress.completedLessons.length / quiz.totalLessons) * 100,
        100
      );
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score,
      percentage,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Server error submitting quiz" });
  }
};

// ✅ Get course progress
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const progress = await Progress.findOne({
      course: courseId,
      student: studentId,
    }).populate("course", "title description");

    if (!progress) {
      return res.status(404).json({ message: "Progress not found for this course" });
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    res.status(500).json({ message: "Server error fetching course progress" });
  }
};

// ✅ Generate certificate after completing a course
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
      certificateId: Math.random().toString(36).substr(2, 9).toUpperCase(),
    });

    // Optionally email the certificate to the student
    await sendEmail({
      to: student.email,
      subject: `Certificate of Completion - ${course.title}`,
      text: `Congratulations ${student.name}! You’ve successfully completed ${course.title}. Certificate ID: ${certificate.certificateId}`,
    });

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Server error generating certificate" });
  }
};
