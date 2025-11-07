// server/controllers/adminController.js

import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import { generateRandomPassword } from "../utils/randomPassword.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * ===========================
 * 👩‍🏫 INSTRUCTOR MANAGEMENT
 * ===========================
 */

/**
 * @desc   Add a new instructor
 * @route  POST /api/admin/instructors
 * @access Admin
 */
export const addInstructor = async (req, res) => {
  try {
    const { name, email } = req.body;

    // 🔎 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User with this email already exists" });

    // 🧩 Generate a random password (plaintext)
    const rawPassword = generateRandomPassword();

    // 🧑‍🏫 Create instructor account — let Mongoose pre-save hook hash password
    const instructor = await User.create({
      name,
      email,
      role: "instructor",
      password: rawPassword,   // let pre('save') handle hashing
      createdByAdmin: true,
      isFirstLogin: true,
    });

    // ✉️ Send credentials via email
    try {
      await sendEmail({
        to: email,
        subject: "Your Instructor Account Has Been Created",
        text: `Hello ${name},

Your instructor account has been created on SkillForge.

Login credentials:
Email: ${email}
Password: ${rawPassword}

Please log in and change your password after your first login.

— SkillForge Team`,
      });
    } catch (emailError) {
      console.warn("⚠️ Email sending failed:", emailError.message);
    }

    // ✅ Return success response
    res.status(201).json({
      message: "Instructor created successfully",
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role,
      },
    });
  } catch (error) {
    console.error("❌ Error creating instructor:", error);
    res.status(500).json({ message: "Failed to create instructor" });
  }
};
