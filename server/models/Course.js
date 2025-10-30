import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },

    // Coursera / External API integration fields
    externalId: { type: String, index: true },
    provider: { type: String, default: "local" },
    partnerIds: [String],
    lastSynced: Date,

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    videos: [
      {
        title: String,
        url: String,
        duration: String,
      },
    ],

    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
