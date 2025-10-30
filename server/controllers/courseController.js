import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import axios from "axios";

/**
 * Get all courses with pagination and optional filters
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

    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("❌ GetAllCourses Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single course by ID (with quizzes)
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate({
        path: "quizzes",
        select: "-correctAnswer",
      });

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    res.status(200).json(course);
  } catch (error) {
    console.error("❌ GetCourseById Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Fetch and Sync Coursera courses to DB
 * (Accessible only to instructors/admins)
 */
export const syncCourseraCourses = async (req, res) => {
  try {
    console.log("🔹 Syncing Coursera courses...");

    const courseraRes = await axios.get("https://api.coursera.org/api/courses.v1", {
      params: { limit: 20 },
    });

    const courseraCourses = courseraRes.data?.elements || [];
    const upserted = [];

    for (const c of courseraCourses) {
      const existing = await Course.findOne({ title: c.name });

      if (existing) {
        existing.description = c.description || existing.description;
        existing.category = c.domainTypes?.[0]?.subdomainId || "General";
        existing.lastSynced = new Date();
        await existing.save();
        upserted.push(existing);
      } else {
        const newCourse = await Course.create({
          title: c.name,
          description: c.description || "No description available",
          category: c.domainTypes?.[0]?.subdomainId || "General",
          price: 0,
          provider: "coursera",
          lastSynced: new Date(),
        });
        upserted.push(newCourse);
      }
    }

    res.status(200).json({
      message: "✅ Coursera courses synced successfully",
      count: upserted.length,
      courses: upserted,
    });
  } catch (error) {
    console.error("❌ Coursera Sync Error:", error.response?.data || error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Update course (for instructor/admin)
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // 🔒 Only admins or course owner (instructor) can edit
    if (
      req.user.role !== "admin" &&
      course.instructor?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Access denied — you can only edit your own courses" });
    }

    Object.assign(course, req.body);
    await course.save();

    res.status(200).json({
      message: "✅ Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("❌ UpdateCourse Error:", error);
    res.status(500).json({ message: error.message });
  }
};
