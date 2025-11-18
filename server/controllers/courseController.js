import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Enrollment from "../models/Enrollment.js";
import cloudinary from "cloudinary";
import fs from "fs";

// -------------------- Cloudinary Config --------------------
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ============================================================
   🧑‍💼 Instructor Course Management
============================================================ */

/**
 * @desc    Create a new course (Instructor only)
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, level, duration } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const content = JSON.parse(req.body.content || "[]");
    const quizzes = JSON.parse(req.body.quizzes || "[]");

    // Upload course thumbnail
    let imageUrl = "";
    if (req.files?.thumbnail?.[0]) {
      const { path: filePath } = req.files.thumbnail[0];
      const result = await cloudinary.v2.uploader.upload(filePath, { folder: "course-thumbnails" });
      imageUrl = result.secure_url;
      fs.unlinkSync(filePath);
    }

    // Upload lesson files (video/pdf)
    const lessonFiles = req.files?.lessonFiles || [];
    const updatedContent = await Promise.all(
      content.map(async (lesson, idx) => {
        if ((lesson.type === "video" || lesson.type === "pdf") && lessonFiles[idx]) {
          const { path: filePath } = lessonFiles[idx];
          const result = await cloudinary.v2.uploader.upload(filePath, {
            folder: "course-lessons",
            resource_type: "auto",
          });
          lesson.url = result.secure_url;
          fs.unlinkSync(filePath);
        } else if (lesson.type === "text") {
          lesson.url = "";
        }
        return lesson;
      })
    );

    const course = await Course.create({
      title,
      description,
      price,
      category,
      level,
      duration,
      instructor: req.user._id,
      isPublished: false,
      content: updatedContent,
      quizzes,
      image: imageUrl,
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error creating course" });
  }
};

/**
 * @desc    Update an existing course
 */
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.instructor.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    const { title, description, price, category, level, duration } = req.body;

    // Update basic fields
    ["title", "description", "price", "category", "level", "duration"].forEach((field) => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    // Update lessons/content
    if (req.body.content) {
      const parsedContent = JSON.parse(req.body.content);
      const lessonFiles = req.files?.lessonFiles || [];

      const updatedContent = await Promise.all(
        parsedContent.map(async (lesson, idx) => {
          if ((lesson.type === "video" || lesson.type === "pdf") && lessonFiles[idx]) {
            const { path: filePath } = lessonFiles[idx];
            const result = await cloudinary.v2.uploader.upload(filePath, {
              folder: "course-lessons",
              resource_type: "auto",
            });
            lesson.url = result.secure_url;
            fs.unlinkSync(filePath);
          }
          return lesson;
        })
      );

      course.content = updatedContent;
    }

    // Update quizzes
    if (req.body.quizzes) {
      course.quizzes = JSON.parse(req.body.quizzes);
    }

    // Update course thumbnail
    if (req.files?.thumbnail?.[0]) {
      const { path: filePath } = req.files.thumbnail[0];
      const result = await cloudinary.v2.uploader.upload(filePath, { folder: "course-thumbnails" });
      course.image = result.secure_url;
      fs.unlinkSync(filePath);
    }

    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Failed to update course" });
  }
};

/**
 * @desc    Publish/unpublish a course
 */
export const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.instructor.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({ success: true, isPublished: course.isPublished });
  } catch (err) {
    console.error("Publish toggle error:", err);
    res.status(500).json({ message: "Failed to toggle publish" });
  }
};

/**
 * @desc    Delete a course
 */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.instructor.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    await Enrollment.deleteMany({ course: course._id });
    await Quiz.deleteMany({ _id: { $in: course.quizzes } });
    await course.deleteOne();

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Failed to delete course" });
  }
};

/**
 * @desc    Get all courses (instructor/admin)
 */
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email").lean();
    res.json({ courses });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * @desc    Get all available courses for students
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name email")
      .lean();
    res.json({ courses });
  } catch (err) {
    console.error("Get available courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses for students" });
  }
};

/**
 * @desc    Get a single course by ID
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")      // instructor info
      .populate("quizzes")                      // full quiz info
      .populate({
        path: "studentsEnrolled",              // virtual populate
        populate: { path: "student", select: "name email" }
      });

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Transform enrolled students for client
    const students = course.studentsEnrolled?.map(e => e.student) || [];

    res.json({ success: true, course: { ...course.toObject(), students } });
  } catch (err) {
    console.error("Get course by ID error:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};
