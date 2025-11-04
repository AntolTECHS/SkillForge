import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const enrolledCourseSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  trialExpiresAt: {
    type: Date, // Automatically set to enrolledAt + 21 days
  },
  hasPaid: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Roles allowed: student, instructor, admin
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    isFirstLogin: {
      type: Boolean,
      default: false,
    },

    createdByAdmin: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ Track enrollments, free trial, and payments
    enrolledCourses: [enrolledCourseSchema],
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Automatically set trial expiry (21 days from enrollment)
userSchema.methods.addCourseEnrollment = function (courseId, trialDays = 21) {
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  this.enrolledCourses.push({
    course: courseId,
    enrolledAt: now,
    trialExpiresAt,
    hasPaid: false,
  });
};

const User = mongoose.model("User", userSchema);
export default User;
