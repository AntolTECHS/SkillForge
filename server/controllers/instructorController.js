// controllers/instructorController.js
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";

/* ============================================================
   📘 Create new course
   ============================================================ */
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, category, level, duration } = req.body;
    const instructorId = req.user._id;

    const course = await Course.create({
      title,
      description,
      thumbnail,
      price,
      category,
      level,
      duration,
      instructor: instructorId,
    });

    res.status(201).json({ success: true, message: "✅ Course created successfully", course });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ success: false, message: "Error creating course" });
  }
};

/* ============================================================
   ✏️ Update existing course
   ============================================================ */
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
    console.error("Error updating course:", err);
    res.status(500).json({ success: false, message: "Error updating course" });
  }
};

/* ============================================================
   🚀 Publish course
   ============================================================ */
export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructor: req.user._id },
      { isPublished: true },
      { new: true }
    );

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found or not yours" });

    res.status(200).json({ success: true, message: "🎉 Course published successfully!", course });
  } catch (err) {
    console.error("Error publishing course:", err);
    res.status(500).json({ success: false, message: "Error publishing course" });
  }
};

/* ============================================================
   🎓 Get instructor's own courses
   ============================================================ */
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate("modules")
      .populate("quizzes");
    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
};

/* ============================================================
   📦 Add Module to a Course
   ============================================================ */
export const addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found or not yours" });

    const module = await Module.create({ title, description });
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({ success: true, message: "Module added successfully", module });
  } catch (err) {
    console.error("Error adding module:", err);
    res.status(500).json({ success: false, message: "Error adding module" });
  }
};

/* ============================================================
   🎬 Add Lesson to a Module
   ============================================================ */
export const addLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, videoUrl, duration } = req.body;

    const lesson = await Lesson.create({ title, description, videoUrl, duration });

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });

    module.lessons.push(lesson._id);
    await module.save();

    res.status(201).json({ success: true, message: "Lesson added successfully", lesson });
  } catch (err) {
    console.error("Error adding lesson:", err);
    res.status(500).json({ success: false, message: "Error adding lesson" });
  }
};

/* ============================================================
   🧠 Add Quiz to a Course
   ============================================================ */
export const addQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions } = req.body; // [{question, options, correctAnswer}]

    const quiz = await Quiz.create({ title, questions });

    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found or not yours" });

    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({ success: true, message: "Quiz added successfully", quiz });
  } catch (err) {
    console.error("Error adding quiz:", err);
    res.status(500).json({ success: false, message: "Error adding quiz" });
  }
};
