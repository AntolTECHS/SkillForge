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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User with this email already exists" });

    // Generate random password
    const password = generateRandomPassword();

    // Create instructor account
    const instructor = await User.create({
      name,
      email,
      role: "instructor",
      password,
      createdByAdmin: true,
      isFirstLogin: true,
    });

    // Send credentials email
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
 * @desc   Get all instructors
 * @route  GET /api/admin/instructors
 * @access Admin
 */
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select("-password");
    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Failed to fetch instructors" });
  }
};

/**
 * @desc   Delete an instructor
 * @route  DELETE /api/admin/instructors/:id
 * @access Admin
 */
export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findOneAndDelete({ _id: id, role: "instructor" });

    if (!instructor)
      return res.status(404).json({ message: "Instructor not found" });

    res.json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    res.status(500).json({ message: "Failed to delete instructor" });
  }
};

/**
 * ===========================
 * 👥 USER MANAGEMENT
 * ===========================
 */

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
 * @desc   Delete a user by ID
 * @route  DELETE /api/admin/user/:id
 * @access Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/**
 * ===========================
 * 💳 PAYMENT MANAGEMENT
 * ===========================
 */

/**
 * @desc   Get all payments
 * @route  GET /api/admin/payments
 * @access Admin
 */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("course", "title");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

/**
 * @desc   Approve payment and enroll user
 * @route  POST /api/admin/payments/:id/approve
 * @access Admin
 */
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    payment.status = "approved";
    await payment.save();

    await Enrollment.create({
      user: payment.user,
      course: payment.course,
    });

    res.status(200).json({ message: "Payment approved successfully", payment });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ message: "Failed to approve payment" });
  }
};

/**
 * @desc   Refund payment and remove enrollment
 * @route  POST /api/admin/payments/:id/refund
 * @access Admin
 */
export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    payment.status = "refunded";
    await payment.save();

    await Enrollment.findOneAndDelete({
      user: payment.user,
      course: payment.course,
    });

    res.status(200).json({ message: "Payment refunded successfully", payment });
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({ message: "Failed to refund payment" });
  }
};
