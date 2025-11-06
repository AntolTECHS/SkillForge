// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    isPublished: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["Programming", "Design", "Marketing", "Business", "Other"],
      default: "Programming",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: { type: String, default: "Self-paced" },
    totalLessons: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;
