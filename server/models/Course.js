// models/Course.js
import mongoose from "mongoose";

/* ------------------------ Lesson Model ------------------------ */
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
}, { timestamps: true });

export const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

/* ------------------------ Module Model ------------------------ */
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
}, { timestamps: true });

export const Module = mongoose.models.Module || mongoose.model("Module", moduleSchema);

/* ------------------------ Quiz Model ------------------------ */
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [String],
      correctAnswer: String,
    },
  ],
}, { timestamps: true });

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

/* ------------------------ Course Model ------------------------ */
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
