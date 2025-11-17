import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    hasPaid: {
      type: Boolean,
      default: false,
    },

    progress: {
      type: Number,
      default: 0, // percent
    },

    started: {
      type: Boolean,
      default: false,
    },

    // ⭐ XP for this specific course
    xpEarned: {
      type: Number,
      default: 0,
    },

    // ⭐ Badge level for this course
    level: {
      type: Number,
      default: 1,
    },

    // ⭐ Rewards (badges unlocked)
    badges: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
