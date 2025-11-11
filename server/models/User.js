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

    // permanent password hash
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // temporary one-time password (hashed)
    tempPasswordHash: {
      type: String,
      default: null,
    },

    // if true, user must change password at next login
    forcePasswordChange: {
      type: Boolean,
      default: false,
    },

    // optional expiry for the temp password
    tempPasswordExpiry: {
      type: Date,
      default: null,
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

    // 🆕 Added this field for soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ✅ Track enrollments, free trial, and payments
    enrolledCourses: [enrolledCourseSchema],
  },
  { timestamps: true }
);

// 🔐 Hash password before saving (permanent password)
userSchema.pre("save", async function (next) {
  // hash permanent password if modified
  if (this.isModified("password")) {
    // Skip re-hashing if already hashed (bcrypt hashes start with "$2")
    if (!(this.password && (this.password.startsWith("$2a$") || this.password.startsWith("$2b$") || this.password.startsWith("$2y$")))) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // hash tempPasswordHash if it's a plain string and was modified
  if (this.isModified("tempPasswordHash") && this.tempPasswordHash) {
    if (!(this.tempPasswordHash.startsWith("$2a$") || this.tempPasswordHash.startsWith("$2b$") || this.tempPasswordHash.startsWith("$2y$"))) {
      const salt = await bcrypt.genSalt(10);
      this.tempPasswordHash = await bcrypt.hash(this.tempPasswordHash, salt);
    }
  }

  next();
});

// 🔑 Compare permanent passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔑 Compare temp (one-time) password
userSchema.methods.matchTempPassword = async function (enteredPassword) {
  if (!this.tempPasswordHash) return false;
  // check expiry if present
  if (this.tempPasswordExpiry && new Date() > this.tempPasswordExpiry) return false;
  return await bcrypt.compare(enteredPassword, this.tempPasswordHash);
};

// ✅ Set a temporary one-time password (hashing will occur on save)
// usage: await user.setTempPassword('plainTemp123', 7); await user.save();
userSchema.methods.setTempPassword = function (plainTempPassword, expiryDays = 7) {
  const now = new Date();
  const expiry = expiryDays ? new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000) : null;

  // store plain string for now — pre('save') will hash it
  this.tempPasswordHash = plainTempPassword;
  this.forcePasswordChange = true;
  this.tempPasswordExpiry = expiry;
  this.createdByAdmin = true; // optional: mark that admin created this user
};

// ✅ Clear temporary password (use after successful permanent password set)
userSchema.methods.clearTempPassword = function () {
  this.tempPasswordHash = null;
  this.forcePasswordChange = false;
  this.tempPasswordExpiry = null;
};

// ✅ Set permanent password and clear temp state
// usage: await user.setPassword('newStrongPassword'); await user.save();
userSchema.methods.setPassword = function (newPlainPassword) {
  this.password = newPlainPassword; // will be hashed by pre('save')
  this.clearTempPassword();
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
