import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "pdf", "text"], default: "text" },
    url: { type: String, required: function() { return this.type !== "text"; } },
    contentText: { type: String, required: function() { return this.type === "text"; } },
    duration: { type: Number }, // optional, in minutes
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
