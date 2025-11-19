// server/controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc Register a new student
 * @route POST /api/auth/register
 * @access Public
 */
export const registerStudent = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password, // hashed via pre('save')
      role: "student",
    });

    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Login (all roles, including temporary password support)
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });
    console.log("Login attempt:", email);
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account is deactivated" });

    // Check permanent password
    const isPermanent = await user.matchPassword(password);
    console.log("Permanent password match:", isPermanent);

    // Check temporary password
    let isTemp = false;
    if (!isPermanent && user.tempPasswordHash) {
      if (!user.tempPasswordExpiry || user.tempPasswordExpiry.getTime() > Date.now()) {
        isTemp = await user.matchTempPassword(password);
        console.log("Temporary password match:", isTemp);
      } else {
        console.log("Temporary password expired");
        return res.status(400).json({ message: "Temporary password expired" });
      }
    }

    if (!isPermanent && !isTemp)
      return res.status(400).json({ message: "Invalid credentials" });

    // ⛔ IMPORTANT FIX:
    // user MUST change password if they logged in with a temporary one
    const forcePasswordChange =
      isTemp || user.forcePasswordChange || user.isFirstLogin;

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      forcePasswordChange: user.forcePasswordChange,
    };

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      user: safeUser,
      token,
      forcePasswordChange,
      message: forcePasswordChange
        ? isTemp
          ? "Logged in with temporary password — please change your password"
          : "Password change required — please update your password"
        : "Login successful",
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Change password (final fix — stops redirect loop)
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    let validCurrent = false;

    // Allow password change WITHOUT current password if it is first login or temp pass usage
    if (user.forcePasswordChange || user.isFirstLogin) {
      validCurrent = true;
    } else if (currentPassword) {
      const matchPermanent = await user.matchPassword(currentPassword);
      const matchTemp =
        user.tempPasswordHash &&
        (await user.matchTempPassword(currentPassword));

      validCurrent = matchPermanent || matchTemp;
    }

    if (!validCurrent)
      return res.status(400).json({ message: "Current password is incorrect" });

    // Update password
    await user.setPassword(newPassword);

    // Clear temporary password fields
    user.tempPasswordHash = null;
    user.tempPasswordExpiry = null;

    // FINAL FIX — stop redirect loop
    user.forcePasswordChange = false;
    user.isFirstLogin = false;

    await user.save();

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      message: "Password changed successfully",

      // MUST return updated flags back to frontend
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,             // now FALSE
        forcePasswordChange: user.forcePasswordChange // now FALSE
      },

      token,
    });
  } catch (error) {
    console.error("❌ Change Password Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get current logged-in user
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      forcePasswordChange: user.forcePasswordChange,
    };

    return res.status(200).json({ user: safeUser });
  } catch (err) {
    console.error("❌ GetMe Error:", err);
    return res.status(500).json({ message: err.message });
  }
};
