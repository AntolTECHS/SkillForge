// models/Lesson.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    videoUrl: String, // hosted video (YouTube, Vimeo, Cloudinary, etc.)
    duration: String, // optional e.g. "15 min"
  },
  { timestamps: true }
);

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
export default Lesson;
