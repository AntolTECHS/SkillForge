// server/controllers/teacherController.js

import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// ✅ Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      teacher: req.user._id,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};

// ✅ Get all courses created by this teacher
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).populate("teacher", "name email");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teacher courses", error: error.message });
  }
};

// ✅ Add a quiz to a specific course
export const addQuizToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions } = req.body; // questions = [{ questionText, options, correctAnswer }]

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quiz = await Quiz.create({
      course: courseId,
      title,
      questions,
    });

    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({
      message: "Quiz added successfully",
      quiz,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding quiz", error: error.message });
  }
};

// ✅ Update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: id, teacher: req.user._id },
      updates,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found or not owned by you" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
};

// ✅ Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCourse = await Course.findOneAndDelete({
      _id: id,
      teacher: req.user._id,
    });

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found or not owned by you" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
};
