import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Certificate from "../models/Certificate.js";
import { generateRandomPassword } from "../utils/randomPassword.js";
import { sendEmail } from "../utils/sendEmail.js";

/* =========================================================
   ⚙️ Async Handler
   ========================================================= */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* =========================================================
   👩‍🏫 INSTRUCTOR MANAGEMENT
   ========================================================= */
export const addInstructor = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: "Name and email are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User with this email already exists" });

  const tempPlain = generateRandomPassword();
  const placeholderPermanent = crypto.randomBytes(32).toString("hex");

  const instructor = new User({
    name,
    email,
    role: "instructor",
    password: placeholderPermanent,
    createdByAdmin: true,
    isFirstLogin: true,
  });

  instructor.setTempPassword(tempPlain, 7);
  await instructor.save();

  try {
    await sendEmail({
      to: email,
      subject: "Your Instructor Account — One-time Login Password",
      text: `Hello ${name},\n\nYour instructor account has been created.\n\nUse this one-time password (expires in 7 days):\n\n${tempPlain}\n\nAfter login, you must change your password.`,
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
      createdByAdmin: instructor.createdByAdmin,
    },
  });
});

export const getAllInstructors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [instructors, total] = await Promise.all([
    User.find({ role: "instructor" })
      .select("-password -tempPasswordHash -tempPasswordExpiry -__v")
      .skip(skip)
      .limit(limit),
    User.countDocuments({ role: "instructor" }),
  ]);

  res.json({ instructors, total, page, pages: Math.ceil(total / limit) });
});

export const deleteInstructor = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.params.id);
  if (!instructor || instructor.role !== "instructor")
    return res.status(404).json({ message: "Instructor not found" });

  await Promise.all([
    Enrollment.deleteMany({ student: instructor._id }),
    Payment.deleteMany({ user: instructor._id }),
    Certificate.deleteMany({ user: instructor._id }),
  ]);

  await instructor.deleteOne();

  res.json({ message: "Instructor hard-deleted successfully" });
});

/* =========================================================
   👥 USER MANAGEMENT
   ========================================================= */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select("-password -tempPasswordHash -tempPasswordExpiry -__v")
      .skip(skip)
      .limit(limit),
    User.countDocuments(),
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await Promise.all([
    Enrollment.deleteMany({ student: user._id }),
    Payment.deleteMany({ user: user._id }),
    Certificate.deleteMany({ user: user._id }),
  ]);

  await user.deleteOne();

  res.json({ message: "User and related data hard-deleted successfully" });
});

/* =========================================================
   📚 COURSE MANAGEMENT
   ========================================================= */
export const getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find()
      .populate("instructor", "name email")
      .skip(skip)
      .limit(limit),
    Course.countDocuments(),
  ]);

  res.json({ courses, total, page, pages: Math.ceil(total / limit) });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Payment.deleteMany({ course: course._id }),
    Certificate.deleteMany({ course: course._id }),
  ]);

  await course.deleteOne();

  res.json({ message: "Course and related data hard-deleted successfully" });
});

/* =========================================================
   💳 PAYMENT MANAGEMENT
   ========================================================= */
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

  res.json({ payments, total, page, pages: Math.ceil(total / limit) });
});

/* =========================================================
   🎓 CERTIFICATE MANAGEMENT
   ========================================================= */
export const getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find()
    .populate("user", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 });

  res.json(certificates);
});

/* =========================================================
   🧾 ENROLLMENTS
   ========================================================= */
export const getAllEnrollments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title")
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(),
  ]);

  res.json({ enrollments, total, page, limit, pages: Math.ceil(total / limit) });
});

/* =========================================================
   📊 DASHBOARD OVERVIEW
   ========================================================= */
export const getOverview = asyncHandler(async (req, res) => {
  const [
    usersCount,
    studentsCount,
    instructorsCount,
    coursesCount,
    enrollmentsCount,
    totalRevenueResult,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  res.json({
    users: usersCount,
    students: studentsCount,
    instructors: instructorsCount,
    courses: coursesCount,
    enrollments: enrollmentsCount,
    revenue: totalRevenue,
  });
});

export default {
  addInstructor,
  getAllInstructors,
  deleteInstructor,
  getAllUsers,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAllPayments,
  getAllCertificates,
  getAllEnrollments,
  getOverview,
};
