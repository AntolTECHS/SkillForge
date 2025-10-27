// server/controllers/adminController.js

import User from "../models/User.js";
import { generateRandomPassword } from "../utils/randomPassword.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * @desc   Add a new instructor
 * @route  POST /api/admin/instructors
 * @access Admin
 */
export const addInstructor = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Generate a random password for the new instructor
    const password = generateRandomPassword();

    const instructor = await User.create({
      name,
      email,
      role: "instructor",
      password,
      createdByAdmin: true,
      isFirstLogin: true,
    });

    // Attempt to send credentials via email
    try {
      await sendEmail({
        to: email,
        subject: "Your Instructor Account Has Been Created",
        text: `Hello ${name},\n\nYour instructor account has been created.\nLogin credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\n— SkillForge Team`,
      });
    } catch (emailError) {
      console.warn("Email sending failed:", emailError.message);
    }

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
    console.error("Error creating instructor:", error);
    res.status(500).json({ message: "Failed to create instructor" });
  }
};

/**
 * @desc   Get all users
 * @route  GET /api/admin/users
 * @access Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * @desc   Get all instructors
 * @route  GET /api/admin/instructors
 * @access Admin
 */
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select(
      "-password"
    );
    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Failed to fetch instructors" });
  }
};

/**
 * @desc   Delete a user by ID
 * @route  DELETE /api/admin/user/:id
 * @access Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
