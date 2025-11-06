// controllers/courseController.js
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Module from "../models/Module.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import axios from "axios";

/**
 * 🟢 Get all courses (with pagination + optional filters)
 */
export const getAllCourses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const query = {
      ...(search ? { title: { $regex: search, $options: "i" } } : {}),
      ...(category ? { category } : {}),
    };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor", "name email")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      courses,
    });
  } catch (error) {
    console.error("❌ getAllCourses Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟢 Get single course by ID (with quizzes)
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate({
        path: "quizzes",
        select: "-correctAnswer", // hide correct answers
      })
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("❌ getCourseById Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🧠 Enroll user in a course with a 21-day free trial
 */
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user?._id;
    const courseId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // check existing enrollment
    const already = user.enrolledCourses.find(
      (c) => c.course.toString() === courseId
    );
    if (already) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 21 days

    user.enrolledCourses.push({
      course: courseId,
      enrollmentDate: now,
      trialEndsAt,
      hasPaid: false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "✅ Enrolled successfully! You have a 21-day free trial.",
      trialEndsAt,
    });
  } catch (error) {
    console.error("❌ enrollCourse Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔍 Check course access (trial + payment)
 */
export const checkCourseAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses.course");
    const courseId = req.params.id;

    const enrollment = user.enrolledCourses.find(
      (c) => c.course._id.toString() === courseId
    );

    if (!enrollment) {
      return res.status(403).json({ access: false, reason: "Not enrolled" });
    }

    const now = new Date();
    const expired = now > new Date(enrollment.trialEndsAt);

    if (expired && !enrollment.hasPaid) {
      return res.status(403).json({
        access: false,
        reason: "Trial expired — please upgrade to continue",
        expired: true,
      });
    }

    res.status(200).json({
      access: true,
      hasPaid: enrollment.hasPaid,
      trialEndsAt: enrollment.trialEndsAt,
      expired: false,
    });
  } catch (error) {
    console.error("❌ checkCourseAccess Error:", error);
    res.status(500).json({ access: false, message: error.message });
  }
};

/**
 * 🔹 Sync Coursera courses
 */
export const syncCourseraCourses = async (req, res) => {
  try {
    console.log("🔹 Syncing Coursera courses...");

    const courseraRes = await axios.get("https://api.coursera.org/api/courses.v1", {
      params: { limit: 20 },
    });

    const courseraCourses = courseraRes.data?.elements || [];
    const results = [];

    for (const c of courseraCourses) {
      const data = {
        title: c.name,
        description: c.description || "No description available",
        category: c.domainTypes?.[0]?.subdomainId || "General",
        provider: "coursera",
        lastSynced: new Date(),
        price: 0,
      };

      const existing = await Course.findOneAndUpdate({ title: c.name }, data, {
        new: true,
      });

      if (existing) {
        results.push(existing);
      } else {
        const created = await Course.create(data);
        results.push(created);
      }
    }

    res.status(200).json({
      success: true,
      message: "✅ Coursera courses synced successfully",
      count: results.length,
      courses: results,
    });
  } catch (error) {
    console.error("❌ syncCourseraCourses Error:", error.response?.data || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✏️ Update course (for instructor/admin)
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isOwner = course.instructor?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied — not authorized" });
    }

    Object.assign(course, req.body);
    await course.save();

    res.status(200).json({
      success: true,
      message: "✅ Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("❌ updateCourse Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
