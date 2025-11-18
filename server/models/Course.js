// server/models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  category: { type: String },
  level: { type: String },
  duration: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublished: { type: Boolean, default: false },
  content: [
    {
      title: String,
      type: String,
      contentText: String,
      url: String,
      quiz: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
        },
      ],
    },
  ],
  quizzes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  ],
  image: { type: String },
}, { timestamps: true });

// Optional: Virtual for students
courseSchema.virtual("studentsEnrolled", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "course",
});

courseSchema.set("toObject", { virtuals: true });
courseSchema.set("toJSON", { virtuals: true });

const Course = mongoose.model("Course", courseSchema);
export default Course; // ✅ Must be default
