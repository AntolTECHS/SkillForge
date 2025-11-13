// server/models/Enrollment.js
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    hasPaid: { type: Boolean, default: false },
    trialExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    },
    progress: { type: Number, default: 0 },
    started: { type: Boolean, default: false }, // <--- Add this
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
