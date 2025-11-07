// server/controllers/adminController.js

import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Certificate from "../models/Certificate.js";
import { generateRandomPassword } from "../utils/randomPassword.js";
import { sendEmail } from "../utils/sendEmail.js";

/* =========================================================
   ⚙️ Utility: Async Wrapper to Simplify Error Handling
   ========================================================= */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* =========================================================
   👩‍🏫 INSTRUCTOR MANAGEMENT
   ========================================================= */

/**
 * @desc   Add a new instructor
 * @route  POST /api/admin/instructors
 * @access Admin
 */
export const addInstructor = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User with this email already exists" });

  const rawPassword = generateRandomPassword();

  const instructor = await User.create({
    name,
    email,
    role: "instructor",
    password: rawPassword,
    createdByAdmin: true,
    isFirstLogin: true,
  });

  // Send login credentials via email (non-blocking)
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

  res.status(201).json({
    message: "Instructor created successfully",
    instructor: {
      id: instructor._id,
      name: instructor.name,
      email: instructor.email,
      role: instructor.role,
    },
  });
});

/**
 * @desc   Get all instructors (paginated)
 * @route  GET /api/admin/instructors
 * @access Admin
 */
export const getAllInstructors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [instructors, total] = await Promise.all([
    User.find({ role: "instructor", isDeleted: { $ne: true } })
      .select("-password")
      .skip(skip)
      .limit(limit),
    User.countDocuments({ role: "instructor", isDeleted: { $ne: true } }),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    instructors,
  });
});

/**
 * @desc   Soft delete instructor
 * @route  DELETE /api/admin/instructors/:id
 * @access Admin
 */
export const deleteInstructor = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.params.id);
  if (!instructor || instructor.role !== "instructor")
    return res.status(404).json({ message: "Instructor not found" });

  instructor.isDeleted = true;
  await instructor.save();

  res.json({ message: "Instructor deleted successfully" });
});

/* =========================================================
   👥 USER MANAGEMENT
   ========================================================= */

/**
 * @desc   Get all users (paginated)
 * @route  GET /api/admin/users
 * @access Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ isDeleted: { $ne: true } })
      .select("-password")
      .skip(skip)
      .limit(limit),
    User.countDocuments({ isDeleted: { $ne: true } }),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    users,
  });
});

/**
 * @desc   Soft delete user
 * @route  DELETE /api/admin/users/:id
 * @access Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isDeleted = true;
  await user.save();

  res.json({ message: "User deleted successfully" });
});

/* =========================================================
   📚 COURSE MANAGEMENT
   ========================================================= */

/**
 * @desc   Get all courses (paginated)
 * @route  GET /api/admin/courses
 * @access Admin
 */
export const getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find({ isDeleted: { $ne: true } })
      .populate("instructor", "name email")
      .populate("category", "name")
      .skip(skip)
      .limit(limit),
    Course.countDocuments({ isDeleted: { $ne: true } }),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    courses,
  });
});

/**
 * @desc   Soft delete course
 * @route  DELETE /api/admin/courses/:id
 * @access Admin
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  course.isDeleted = true;
  await course.save();

  res.json({ message: "Course deleted successfully" });
});

/* =========================================================
   💳 PAYMENT MANAGEMENT
   ========================================================= */

/**
 * @desc   Get all payments (paginated)
 * @route  GET /api/admin/payments
 * @access Admin
 */
export const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find()
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    payments,
  });
});

/* =========================================================
   🎓 CERTIFICATE MANAGEMENT
   ========================================================= */

/**
 * @desc   Get all certificates (paginated)
 * @route  GET /api/admin/certificates
 * @access Admin
 */
export const getAllCertificates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [certificates, total] = await Promise.all([
    Certificate.find()
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Certificate.countDocuments(),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    certificates,
  });
});

/* =========================================================
   📊 DASHBOARD OVERVIEW
   ========================================================= */

/**
 * @desc   Get admin overview metrics
 * @route  GET /api/admin/overview
 * @access Admin
 */
export const getOverview = asyncHandler(async (req, res) => {
  const [usersCount, instructorsCount, coursesCount, enrollmentsCount, totalRevenue] =
    await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ role: "instructor", isDeleted: { $ne: true } }),
      Course.countDocuments({ isDeleted: { $ne: true } }),
      Enrollment.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

  res.json({
    users: usersCount,
    instructors: instructorsCount,
    courses: coursesCount,
    enrollments: enrollmentsCount,
    revenue: totalRevenue[0]?.total || 0,
  });
});
