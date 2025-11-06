// models/Module.js
import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

const Module = mongoose.models.Module || mongoose.model("Module", moduleSchema);
export default Module;
