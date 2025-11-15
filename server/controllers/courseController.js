import Course from "../models/Course.js";

/**
 * @desc    Create a new course (instructor only)
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    // Parse lesson content and quizzes safely
    const content = JSON.parse(req.body.content || "[]"); // lessons
    const quizzes = JSON.parse(req.body.quizzes || "[]"); // quizzes

    // Handle lesson files (video/pdf)
    const lessonFiles = req.files?.files || [];
    const updatedContent = content.map((lesson, idx) => {
      if ((lesson.type === "video" || lesson.type === "pdf") && lessonFiles[idx]) {
        lesson.url = `${req.protocol}://${req.get("host")}/uploads/${lessonFiles[idx].filename}`;
      } else if (lesson.type === "text") {
        lesson.url = "";
      }
      return lesson;
    });

    // Handle course image
    let imageUrl = "";
    if (req.files?.image?.[0]) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.image[0].filename}`;
    }

    const course = await Course.create({
      title,
      description,
      price,
      category,
      image: imageUrl,
      content: updatedContent,
      quizzes,
      instructor: req.user._id,
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error creating course" });
  }
};

/**
 * @desc    Get all courses (admin/instructor)
 */
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .lean();

    const coursesWithUrls = courses.map((course) => ({
      ...course,
      image: course.image
        ? course.image.startsWith("http")
          ? course.image
          : `${req.protocol}://${req.get("host")}${course.image}`
        : "",
      content: Array.isArray(course.content)
        ? course.content.map((lesson) => ({
            ...lesson,
            url: lesson.url
              ? lesson.url.startsWith("http")
                ? lesson.url
                : `${req.protocol}://${req.get("host")}${lesson.url}`
              : "",
          }))
        : [],
    }));

    res.json({ courses: coursesWithUrls });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * @desc    Get all courses for students (available to enroll)
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .lean();

    const coursesWithUrls = courses.map((course) => ({
      ...course,
      image: course.image
        ? course.image.startsWith("http")
          ? course.image
          : `${req.protocol}://${req.get("host")}${course.image}`
        : "",
      content: Array.isArray(course.content)
        ? course.content.map((lesson) => ({
            ...lesson,
            url: lesson.url
              ? lesson.url.startsWith("http")
                ? lesson.url
                : `${req.protocol}://${req.get("host")}${lesson.url}`
              : "",
          }))
        : [],
    }));

    res.json({ courses: coursesWithUrls });
  } catch (err) {
    console.error("Get available courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses for students" });
  }
};

/**
 * @desc    Get a single course by ID (full details)
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Ensure URLs are absolute
    const courseWithUrls = {
      ...course,
      image: course.image
        ? course.image.startsWith("http")
          ? course.image
          : `${req.protocol}://${req.get("host")}${course.image}`
        : "",
      content: Array.isArray(course.content)
        ? course.content.map((lesson) => ({
            ...lesson,
            url: lesson.url
              ? lesson.url.startsWith("http")
                ? lesson.url
                : `${req.protocol}://${req.get("host")}${lesson.url}`
              : "",
          }))
        : [],
    };

    res.json(courseWithUrls);
  } catch (err) {
    console.error("Get course by ID error:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};
