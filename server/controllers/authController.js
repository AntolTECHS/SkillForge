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

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
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
    console.log("🪵 LOGIN BODY:", req.body); // 👈 Debug incoming credentials

    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account is deactivated" });

    // 🔹 Check if instructor must change password on first login
    if (user.role === "instructor" && user.isFirstLogin) {
      return res.status(200).json({
        message: "First login, please change your password",
        firstLogin: true,
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    }

    // ✅ Normal login success
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
 * @desc    Change Password (first-time instructor or profile update)
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

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // ✅ Update new password
    user.password = newPassword;
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
