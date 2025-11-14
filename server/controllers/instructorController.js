// server/controllers/instructorController.js

import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

/* ============================================================
   🧑‍💼 Instructor Profile
   ============================================================ */

// Get instructor profile
export const getProfile = async (req, res) => {
  try {
    const { name, email, notifications, darkMode } = req.user;
    res.status(200).json({
      success: true,
      profile: { name, email, notifications, darkMode },
    });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// Update instructor profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, notifications, darkMode } = req.body;

    req.user.name = name ?? req.user.name;
    req.user.email = email ?? req.user.email;
    req.user.notifications = notifications ?? req.user.notifications;
    req.user.darkMode = darkMode ?? req.user.darkMode;

    await req.user.save();

    res.status(200).json({
      success: true,
      profile: req.user,
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

/* ============================================================
   📘 Courses CRUD
   ============================================================ */

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, category, level, duration } = req.body;

    if (!title || !description)
      return res.status(400).json({ success: false, message: "Title and description are required" });

    const course = await Course.create({
      title,
      description,
      thumbnail,
      price,
      category,
      level,
      duration,
      instructor: req.user._id,
      isPublished: false,
      quizzes: [],
    });

    res.status(201).json({ success: true, message: "✅ Course created successfully", course });
  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ success: false, message: "Error creating course" });
  }
};

// Update existing course
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructor: req.user._id },
      updates,
      { new: true }
    );

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found or not owned by you" });

    res.status(200).json({ success: true, message: "Course updated", course });
  } catch (err) {
    console.error("❌ Error updating course:", err);
    res.status(500).json({ success: false, message: "Error updating course" });
  }
};

// Publish / Unpublish Course
export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found or not yours" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: course.isPublished
        ? "🎉 Course published successfully!"
        : "🚫 Course unpublished successfully!",
      course,
    });
  } catch (err) {
    console.error("❌ Error toggling publish:", err);
    res.status(500).json({ success: false, message: "Error publishing/unpublishing course" });
  }
};

// Delete a Course (HARD DELETE)
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found or not yours" });

    // Delete quizzes and enrollments
    await Quiz.deleteMany({ _id: { $in: course.quizzes } });
    await Enrollment.deleteMany({ course: course._id });

    // Delete the course itself
    await course.deleteOne();

    res.status(200).json({ success: true, message: "🗑️ Course deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting course:", err);
    res.status(500).json({ success: false, message: "Error deleting course" });
  }
};

/* ============================================================
   🎓 Instructor's Courses (paginated)
   ============================================================ */
export const getMyCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find({ instructor: req.user._id })
        .populate("quizzes")
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments({ instructor: req.user._id }),
    ]);

    const coursesWithStudentCount = await Promise.all(
      courses.map(async (course) => {
        const studentsCount = await Enrollment.countDocuments({ course: course._id });
        return { ...course.toObject(), studentsCount };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithStudentCount,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
};

// Get a specific course by ID
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate("quizzes")
      .populate({
        path: "studentsEnrolled",
        select: "name email",
      });

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (req.user.role === "instructor" && !course.instructor.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized to view this course" });

    res.status(200).json({ success: true, course });
  } catch (err) {
    console.error("❌ Error fetching course:", err);
    res.status(500).json({ success: false, message: "Error fetching course details" });
  }
};

/* ============================================================
   🧠 Quiz Management
   ============================================================ */
export const addQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions))
      return res.status(400).json({ success: false, message: "Quiz title and questions are required" });

    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found or not yours" });

    const quiz = await Quiz.create({ title, questions });
    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({ success: true, message: "🧠 Quiz added successfully", quiz });
  } catch (err) {
    console.error("❌ Error adding quiz:", err);
    res.status(500).json({ success: false, message: "Error adding quiz" });
  }
};

/* ============================================================
   👨‍🎓 Get students enrolled in instructor's courses
   Supports optional courseId filter
   ============================================================ */
export const getStudentsForInstructor = async (req, res) => {
  try {
    const { page = 1, limit = 20, courseId } = req.query;
    const skip = (page - 1) * limit;

    let coursesQuery = { instructor: req.user._id };
    if (courseId) coursesQuery._id = courseId;

    const courses = await Course.find(coursesQuery).select("_id title");
    const courseIds = courses.map((c) => c._id);

    if (!courseIds.length)
      return res.status(200).json({ success: true, students: [], total: 0, page: Number(page), limit: Number(limit) });

    const total = await Enrollment.countDocuments({ course: { $in: courseIds } });

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email")
      .populate("course", "title")
      .skip(skip)
      .limit(Number(limit));

    const students = enrollments.map((e) => ({
      _id: e.student._id,
      name: e.student.name,
      email: e.student.email,
      course: e.course.title,
    }));

    res.status(200).json({ success: true, students, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
};
