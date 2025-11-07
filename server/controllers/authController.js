// server/controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🪵 REGISTER BODY:", req.body);

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login (Student, Instructor, Admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    console.log("🪵 LOGIN BODY:", req.body);

    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // Compare password using bcrypt directly (handles both hashed and pre-hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account is deactivated" });

    // 🔹 First login for instructor
    if (user.role === "instructor" && user.isFirstLogin) {
      return res.status(200).json({
        message: "First login, please change your password",
        firstLogin: true,
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    }

    // ✅ Successful login
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Change Password (for first-time instructor or user update)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    console.log("🪵 CHANGE PASSWORD BODY:", req.body);

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // ✅ Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.isFirstLogin = false;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    console.error("❌ Change Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};
