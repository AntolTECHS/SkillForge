import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    videoUrl: String,
  },
  { timestamps: true }
);

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
export default Lesson;
