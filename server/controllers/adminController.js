import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Certificate from "../models/Certificate.js";
import { generateRandomPassword } from "../utils/randomPassword.js";
import { sendEmail } from "../utils/sendEmail.js";

/* =========================================================
   ⚙️ Utility: Async Wrapper
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

  // Generate + hash password
  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const instructor = await User.create({
    name,
    email,
    role: "instructor",
    password: hashedPassword,
    createdByAdmin: true,
    isFirstLogin: true,
  });

  console.log("✅ Instructor created:", { email, rawPassword });

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

export const getAllInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: "instructor" }).select("-password");
  if (!instructors.length)
    return res.status(404).json({ message: "No instructors found" });
  res.json(instructors);
});

export const deleteInstructor = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.params.id);
  if (!instructor || instructor.role !== "instructor")
    return res.status(404).json({ message: "Instructor not found" });

  // ❗ Do NOT delete their courses — only remove instructor record
  await instructor.deleteOne();

  res.json({ message: "Instructor deleted successfully (courses retained)" });
});

/* =========================================================
   👥 USER MANAGEMENT
   ========================================================= */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select("-password").skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);

  if (!users.length)
    return res.status(404).json({ message: "No users found" });

  res.json({
    users,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Clean up data related to the user
  await Promise.all([
    Enrollment.deleteMany({ user: user._id }),
    Payment.deleteMany({ user: user._id }),
    Certificate.deleteMany({ user: user._id }),
  ]);

  await user.deleteOne();
  res.json({ message: "User and related data deleted successfully" });
});

/* =========================================================
   📚 COURSE MANAGEMENT
   ========================================================= */
export const getAllCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find()
      .populate("instructor", "name email")
      .populate("category", "name")
      .skip(skip)
      .limit(Number(limit)),
    Course.countDocuments(),
  ]);

  if (!courses.length)
    return res.status(404).json({ message: "No courses found" });

  res.json({
    courses,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  // Remove enrollments, payments, and certificates related to this course
  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Payment.deleteMany({ course: course._id }),
    Certificate.deleteMany({ course: course._id }),
  ]);

  await course.deleteOne();
  res.json({ message: "Course and related data deleted successfully" });
});

/* =========================================================
   💳 PAYMENT MANAGEMENT (with pagination)
   ========================================================= */
export const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find()
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(),
  ]);

  if (!payments.length)
    return res.status(404).json({ message: "No payments found" });

  res.json({
    payments,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

/* =========================================================
   🎓 CERTIFICATE MANAGEMENT
   ========================================================= */
export const getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find()
    .populate("user", "name email")
    .populate("course", "title")
    .sort({ createdAt: -1 });

  if (!certificates.length)
    return res.status(404).json({ message: "No certificates found" });

  res.json(certificates);
});

/* =========================================================
   🧾 ENROLLMENTS, ATTENDANCE, ASSIGNMENTS
   ========================================================= */
export const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate("user", "name email")
    .populate("course", "title");

  if (!enrollments.length)
    return res.status(404).json({ message: "No enrollments found" });

  res.json(enrollments);
});

export const getAllAttendance = asyncHandler(async (req, res) => {
  res.json([]); // Placeholder for future logic
});

export const getAllAssignments = asyncHandler(async (req, res) => {
  res.json([]); // Placeholder for future logic
});

/* =========================================================
   📊 DASHBOARD OVERVIEW (Enhanced)
   ========================================================= */
export const getOverview = asyncHandler(async (req, res) => {
  const [
    usersCount,
    studentsCount,
    instructorsCount,
    coursesCount,
    enrollmentsCount,
    totalRevenueResult,
    recentEnrollments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Enrollment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  res.json({
    users: usersCount,
    students: studentsCount,
    instructors: instructorsCount,
    courses: coursesCount,
    enrollments: enrollmentsCount,
    recentEnrollments,
    revenue: totalRevenue,
  });
});
