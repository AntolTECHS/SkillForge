import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";

/**
 * Get all courses with pagination and optional filters
 * GET /api/courses
 * Query: ?page=1&limit=10&category=...&search=...
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

    res.status(200).json({ courses, page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single course by id (with quizzes populated)
 * GET /api/courses/:id
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate({
        path: "quizzes",
        select: "-correctAnswer", // hide correct answers when sending to front (unless teacher)
      });

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Public search by title or description
 * GET /api/courses/search?q=...
 */
export const searchCourses = async (req, res) => {
  try {
    const q = req.query.q || "";
    const courses = await Course.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllCourses,
  getCourseById,
  searchCourses,
};
