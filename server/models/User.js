import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ============================================================
   📌 Enrolled courses sub-schema
   ============================================================ */
const enrolledCourseSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  enrolledAt: {
    type: Date,
    default: Date.now,
  },

  hasPaid: {
    type: Boolean,
    default: false,
  },

  progress: {
    type: Number,
    default: 0, // 0–100%
  },

  started: {
    type: Boolean,
    default: false, // Track if the course was opened
  },
});

/* ============================================================
   📌 User Schema
   ============================================================ */
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

    // 🔑 Temporary login password logic
    tempPasswordHash: { type: String, default: null },
    forcePasswordChange: { type: Boolean, default: false },
    tempPasswordExpiry: { type: Date, default: null },

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

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ⭐ XP system for rewards/badges
    xp: {
      type: Number,
      default: 0,
    },

    // ⭐ Badges assigned by XP milestones
    badges: [
      {
        type: String,
      },
    ],

    // ⭐ Courses the student is enrolled in
    enrolledCourses: [enrolledCourseSchema],
  },
  { timestamps: true }
);

/* ============================================================
   🔐 PASSWORD / TEMP PASSWORD LOGIC
   ============================================================ */
userSchema.pre("save", async function (next) {
  // Hash permanent password
  if (this.isModified("password")) {
    if (
      !(
        this.password.startsWith("$2a$") ||
        this.password.startsWith("$2b$") ||
        this.password.startsWith("$2y$")
      )
    ) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Hash temp password
  if (this.isModified("tempPasswordHash") && this.tempPasswordHash) {
    if (
      !(
        this.tempPasswordHash.startsWith("$2a$") ||
        this.tempPasswordHash.startsWith("$2b$") ||
        this.tempPasswordHash.startsWith("$2y$")
      )
    ) {
      const salt = await bcrypt.genSalt(10);
      this.tempPasswordHash = await bcrypt.hash(this.tempPasswordHash, salt);
    }
  }

  next();
});

// Compare permanent password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare temporary password
userSchema.methods.matchTempPassword = async function (enteredPassword) {
  if (!this.tempPasswordHash) return false;
  if (this.tempPasswordExpiry && new Date() > this.tempPasswordExpiry)
    return false;
  return await bcrypt.compare(enteredPassword, this.tempPasswordHash);
};

// Set a temporary one-time password
userSchema.methods.setTempPassword = function (plainTempPassword, expiryDays = 7) {
  const now = new Date();
  const expiry = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

  this.tempPasswordHash = plainTempPassword;
  this.forcePasswordChange = true;
  this.tempPasswordExpiry = expiry;
  this.createdByAdmin = true;
};

// Clear temp password
userSchema.methods.clearTempPassword = function () {
  this.tempPasswordHash = null;
  this.forcePasswordChange = false;
  this.tempPasswordExpiry = null;
};

// Set permanent password
userSchema.methods.setPassword = function (newPlainPassword) {
  this.password = newPlainPassword;
  this.clearTempPassword();
};

/* ============================================================
   ⭐ Clean enrollment function (NO TRIAL)
   ============================================================ */
userSchema.methods.addCourseEnrollment = function (courseId) {
  this.enrolledCourses.push({
    course: courseId,
    hasPaid: false,
    progress: 0,
    started: false,
  });
};

/* ============================================================
   ⭐ Update course progress & award XP
   ============================================================ */
userSchema.methods.updateCourseProgress = async function (courseId, newProgress) {
  const enrollment = this.enrolledCourses.find(
    (c) => c.course.toString() === courseId.toString()
  );
  if (!enrollment) throw new Error("Enrollment not found");

  newProgress = Math.min(newProgress, 100);
  let xpGained = 0;

  // 1️⃣ First-time opening
  if (!enrollment.started && newProgress > 0) {
    enrollment.started = true;
    xpGained += 2;
  }

  // 2️⃣ Every 10% progress
  const oldTens = Math.floor(enrollment.progress / 10);
  const newTens = Math.floor(newProgress / 10);
  if (newTens > oldTens) xpGained += (newTens - oldTens);

  // 3️⃣ Completion bonus
  if (enrollment.progress < 100 && newProgress === 100) xpGained += 5;

  enrollment.progress = newProgress;

  // Update user XP & badges
  this.xp += xpGained;

  const badges = [];
  if (this.xp >= 1000) badges.push("Level 1 Achiever");
  if (this.xp >= 2000) badges.push("Level 2 Scholar");
  if (this.xp >= 3000) badges.push("Level 3 Champion");

  this.badges = [...new Set([...this.badges, ...badges])];

  await this.save();
  return { xpGained, newProgress, badges: this.badges };
};

const User = mongoose.model("User", userSchema);
export default User;
