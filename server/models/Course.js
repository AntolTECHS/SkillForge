// server/models/Course.js
import mongoose from "mongoose";

// -------------------- Embedded Quiz Schema --------------------
const embeddedQuizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
}, { _id: false }); // No _id for embedded quizzes

// -------------------- Lesson Schema --------------------
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["text", "video", "pdf"], required: true },
  contentText: { type: String, default: "" },
  url: { type: String, default: "" },
  quiz: [embeddedQuizSchema], // Optional quizzes per lesson
}, { _id: false });

// -------------------- Course Schema --------------------
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  category: { type: String, default: "" },
  level: { type: String, default: "" },
  duration: { type: String, default: "" },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublished: { type: Boolean, default: false },
  content: [lessonSchema], // Array of lessons
  quizzes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }, // Optional separate quizzes for the course
  ],
  image: { type: String, default: "" },
}, { timestamps: true });

// -------------------- Virtual: Students Enrolled --------------------
courseSchema.virtual("studentsEnrolled", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "course",
});

// Enable virtuals in JSON and Object output
courseSchema.set("toObject", { virtuals: true });
courseSchema.set("toJSON", { virtuals: true });

// -------------------- Model --------------------
const Course = mongoose.model("Course", courseSchema);
export default Course; // Must be default
