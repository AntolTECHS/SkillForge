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
    console.log("🪵 REGISTER BODY:", { name, email }); // do not log password

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Create student - model pre('save') will hash password if needed,
    // but hashing here is fine as well. We'll let model handle hashing to keep logic central.
    const user = await User.create({
      name,
      email,
      password, // will be hashed by User model pre('save')
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
 *
 * Behavior:
 * - Accepts permanent password (user.password) OR one-time temp password (user.tempPasswordHash)
 * - If one-time password is used, response includes forcePasswordChange: true
 * - If user.forcePasswordChange is already set, login with permanent password is still allowed
 *   but response will include forcePasswordChange: true (so frontend can force a change)
 */
export const loginUser = async (req, res) => {
  try {
    console.log("🪵 LOGIN BODY:", { email: req.body?.email }); // avoid logging password

    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account is deactivated" });

    // Try permanent password first (using model helper)
    const isPermanent = await user.matchPassword(password);

    // Try temp one-time password (if permanent didn't match)
    const isTemp = !isPermanent && (await user.matchTempPassword(password));

    if (!isPermanent && !isTemp) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // At this point, login succeeded with either permanent or temp password.
    // Generate token. Consider returning a short-lived token if isTemp is true.
    // For simplicity, we issue the same token but include a flag in the response.
    const token = generateToken(user._id, user.role);

    // If login used temp password OR user.forcePasswordChange is set -> force frontend to change password
    const needForceChange = Boolean(isTemp || user.forcePasswordChange || user.isFirstLogin);

    // If temp password was used you might want to keep force flags as-is (do not clear them here).
    // Clearing happens after user explicitly changes password via changePassword endpoint.

    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };

    // include the force flag so frontend can redirect to change-password UI
    if (needForceChange) {
      return res.status(200).json({
        ...payload,
        forcePasswordChange: true,
        message: isTemp
          ? "Logged in with temporary password — please change your password"
          : "Password change required — please update your password",
      });
    }

    // Normal login
    return res.status(200).json(payload);
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Change Password (for first-time instructor, forced reset, or normal update)
 * @route   PUT /api/auth/change-password
 * @access  Private (requires authentication middleware that sets req.user)
 *
 * Behavior:
 * - If user.forcePasswordChange === true OR user.isFirstLogin === true:
 *     - Allow password change WITHOUT currentPassword (user was issued a temp password)
 * - Else:
 *     - Require `currentPassword` to match existing permanent password
 *
 * On success:
 * - Set the permanent password
 * - Clear tempPasswordHash, tempPasswordExpiry, forcePasswordChange, isFirstLogin
 */
export const changePassword = async (req, res) => {
  try {
    console.log("🪵 CHANGE PASSWORD BODY:", { hasCurrent: Boolean(req.body.currentPassword) }); // do not log passwords

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password is required and must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isForced = Boolean(user.forcePasswordChange || user.isFirstLogin);

    if (!isForced) {
      // Normal change: require currentPassword
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    } else {
      // Forced change (temp password flow) - optionally verify that a temp password was used recently.
      // We assume the user has already authenticated (has token). No extra verification here.
    }

    // Use model helper to set permanent password and clear temp state
    user.setPassword(newPassword);
    user.isFirstLogin = false;
    user.forcePasswordChange = false;
    user.tempPasswordHash = null;
    user.tempPasswordExpiry = null;

    await user.save();

    // Optionally return a refreshed token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Password changed successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Change Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};
