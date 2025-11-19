import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Faster lookups for /me route
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    certificateUrl: {
      type: String, // URL of generated PDF or Cloudinary file
      required: true,
      trim: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Prevent issuing duplicate certificates for
 * the same student and the same course.
 */
certificateSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
