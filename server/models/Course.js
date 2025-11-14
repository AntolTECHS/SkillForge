import mongoose from "mongoose";

/* ========================
   Lesson Schema
======================== */
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["text", "video", "pdf"], default: "text" },
  url: {
    type: String,
    required: function () {
      return this.type !== "text";
    },
  },
  contentText: {
    type: String,
    required: function () {
      return this.type === "text";
    },
  },
});

/* ========================
   Question Schema for Quizzes
======================== */
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

/* ========================
   Quiz Schema
======================== */
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
});

/* ========================
   Course Schema
======================== */
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String }, // course thumbnail/image
    content: [lessonSchema], // lessons
    quizzes: [quizSchema],   // quizzes
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Add this
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
