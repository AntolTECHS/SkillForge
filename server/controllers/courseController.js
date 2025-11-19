import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import cloudinary from "cloudinary";
import fs from "fs";

// -------------------- Cloudinary Config --------------------
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------- Helper --------------------
const uploadToCloudinary = async (filePath, folder, resourceType = "auto") => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    fs.unlinkSync(filePath);
    return "";
  }
};

/* ============================================================
   🧑‍💼 Instructor Course Management
============================================================ */

/**
 * Create a new course
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, level, duration } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    let content = [];
    try {
      content = JSON.parse(req.body.content || "[]"); // lessons
    } catch {
      return res.status(400).json({ message: "Invalid JSON for content" });
    }

    // Upload thumbnail
    let imageUrl = "";
    if (req.files?.thumbnail?.[0]) {
      imageUrl = await uploadToCloudinary(req.files.thumbnail[0].path, "course-thumbnails");
    }

    // Upload lesson files and sanitize quizzes
    const lessonFiles = req.files?.lessonFiles || [];
    const updatedContent = await Promise.all(
      content.map(async (lesson, idx) => {
        if ((lesson.type === "video" || lesson.type === "pdf") && lessonFiles[idx]) {
          lesson.url = await uploadToCloudinary(lessonFiles[idx].path, "course-lessons");
        } else {
          lesson.url = lesson.url || "";
        }

        // Sanitize quizzes
        if (lesson.quiz?.length) {
          lesson.quiz = lesson.quiz.map((q) => ({
            question: q.question || "",
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""],
            correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          }));
        }

        return lesson;
      })
    );

    const course = await Course.create({
      title,
      description,
      price: Number(price) || 0,
      category: category || "",
      level: level || "",
      duration: duration || "",
      instructor: req.user._id,
      isPublished: true,
      content: updatedContent,
      image: imageUrl,
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error creating course" });
  }
};

/**
 * Update an existing course
 */
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.instructor.equals(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    ["title", "description", "price", "category", "level", "duration"].forEach((field) => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    if (req.body.content) {
      let parsedContent = [];
      try {
        parsedContent = JSON.parse(req.body.content);
      } catch {
        return res.status(400).json({ message: "Invalid content JSON format" });
      }

      const lessonFiles = req.files?.lessonFiles || [];
      const updatedContent = await Promise.all(
        parsedContent.map(async (lesson, idx) => {
          if ((lesson.type === "video" || lesson.type === "pdf") && lessonFiles[idx]) {
            lesson.url = await uploadToCloudinary(lessonFiles[idx].path, "course-lessons");
          } else {
            lesson.url = lesson.url || "";
          }

          // Sanitize quizzes
          if (lesson.quiz?.length) {
            lesson.quiz = lesson.quiz.map((q) => ({
              question: q.question || "",
              options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""],
              correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            }));
          }

          return lesson;
        })
      );

      course.content = updatedContent;
    }

    if (req.files?.thumbnail?.[0]) {
      course.image = await uploadToCloudinary(req.files.thumbnail[0].path, "course-thumbnails");
    }

    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Failed to update course" });
  }
};

/**
 * Get all courses (instructor/admin)
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
 * Get all available courses (students)
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name email")
      .lean();
    res.json({ courses });
  } catch (err) {
    console.error("Get available courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate({
        path: "studentsEnrolled",
        populate: { path: "student", select: "name email" },
      });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const students = course.studentsEnrolled?.map((e) => e.student) || [];
    res.json({ success: true, course: { ...course.toObject(), students } });
  } catch (err) {
    console.error("Get course by ID error:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

/**
 * Publish/unpublish course
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
 * Delete a course
 */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.instructor.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Failed to delete course" });
  }
};
