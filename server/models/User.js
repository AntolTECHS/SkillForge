import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

    // 👇 For instructors added by admin who must change password on first login
    isFirstLogin: {
      type: Boolean,
      default: false,
    },

    // 👇 Indicates if this account was created by an admin
    createdByAdmin: {
      type: Boolean,
      default: false,
    },

    // 👇 Allows deactivating accounts (e.g. suspend student/instructor)
    isActive: {
      type: Boolean,
      default: true,
    },
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

const User = mongoose.model("User", userSchema);
export default User;
