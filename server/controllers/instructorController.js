import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

/* ============================================================
   🧑‍💼 Instructor Profile
============================================================ */

export const getProfile = async (req, res) => {
  try {
    const { name, email, notifications, darkMode } = req.user;
    res.status(200).json({
      success: true,
      profile: { name, email, notifications, darkMode },
    });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, notifications, darkMode } = req.body;

    req.user.name = name ?? req.user.name;
    req.user.email = email ?? req.user.email;
    req.user.notifications = notifications ?? req.user.notifications;
    req.user.darkMode = darkMode ?? req.user.darkMode;

    await req.user.save();

    res.status(200).json({ success: true, profile: req.user });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

/* ============================================================
   📘 Courses CRUD
============================================================ */

export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, level, duration } = req.body;
    if (!title || !description)
      return res.status(400).json({ success: false, message: "Title and description are required" });

    const course = new Course({
      title,
      description,
      price,
      category,
      level,
      duration,
      instructor: req.user._id,
      isPublished: false,
      quizzes: [],
      content: [],
      image: "", // unified field for thumbnail
    });

    // Handle course image
    if (req.files?.thumbnail?.[0]) {
      course.image = `${req.protocol}://${req.get("host")}/uploads/${req.files.thumbnail[0].filename}`;
    }

    // Handle lesson files
    if (req.files?.lessonFiles) {
      course.content = req.files.lessonFiles.map((file) => ({
        title: "",
        type: file.mimetype.startsWith("video") ? "video" : "file",
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      }));
    }

    await course.save();

    res.status(201).json({ success: true, message: "✅ Course created successfully", course });
  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ success: false, message: "Error creating course" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.instructor.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized to edit this course" });

    // Update basic fields
    const fields = ["title", "description", "price", "category", "level", "duration"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    // Update content JSON
    if (req.body.content) {
      try {
        const parsedContent = JSON.parse(req.body.content);
        if (req.files?.lessonFiles) {
          req.files.lessonFiles.forEach((file, idx) => {
            if (parsedContent[idx]) {
              parsedContent[idx].url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
            }
          });
        }
        course.content = parsedContent;
      } catch {
        return res.status(400).json({ success: false, message: "Invalid JSON for content" });
      }
    }

    // Update quizzes JSON
    if (req.body.quizzes) {
      try {
        course.quizzes = JSON.parse(req.body.quizzes);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid JSON for quizzes" });
      }
    }

    // Update course image
    if (req.files?.thumbnail?.[0]) {
      course.image = `${req.protocol}://${req.get("host")}/uploads/${req.files.thumbnail[0].filename}`;
    }

    await course.save();

    res.status(200).json({ success: true, message: "Course updated successfully", course });
  } catch (err) {
    console.error("❌ Error updating course:", err);
    res.status(500).json({ success: false, message: "Error updating course" });
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.instructor.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized to change publish status" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: course.isPublished ? "🎉 Course published successfully!" : "🚫 Course unpublished successfully!",
      course,
    });
  } catch (err) {
    console.error("❌ Error toggling publish:", err);
    res.status(500).json({ success: false, message: "Error publishing/unpublishing course" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.instructor.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized to delete this course" });

    await Quiz.deleteMany({ _id: { $in: course.quizzes } });
    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.status(200).json({ success: true, message: "🗑️ Course deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting course:", err);
    res.status(500).json({ success: false, message: "Error deleting course" });
  }
};

/* ============================================================
   🎓 Instructor Courses Paginated
============================================================ */

export const getMyCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find({ instructor: req.user._id }).populate("quizzes").skip(skip).limit(Number(limit)),
      Course.countDocuments({ instructor: req.user._id }),
    ]);

    const coursesWithStudentCount = await Promise.all(
      courses.map(async (course) => {
        const studentsCount = await Enrollment.countDocuments({ course: course._id });
        return {
          ...course.toObject(),
          studentsCount,
          image: course.image || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithStudentCount,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate("quizzes")
      .populate({ path: "studentsEnrolled", select: "name email" });

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (req.user?.role === "instructor" && !course.instructor.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized to view this course" });

    const courseObj = course.toObject();
    courseObj.image = courseObj.image || null;

    res.status(200).json({ success: true, course: courseObj });
  } catch (err) {
    console.error("❌ Error fetching course:", err);
    res.status(500).json({ success: false, message: "Error fetching course details" });
  }
};

/* ============================================================
   🧠 Quiz Management
============================================================ */

export const addQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions))
      return res.status(400).json({ success: false, message: "Quiz title and questions are required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.instructor.equals(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized to add quiz to this course" });

    const quiz = await Quiz.create({ title, questions });
    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({ success: true, message: "🧠 Quiz added successfully", quiz });
  } catch (err) {
    console.error("❌ Error adding quiz:", err);
    res.status(500).json({ success: false, message: "Error adding quiz" });
  }
};

/* ============================================================
   👨‍🎓 Students for Instructor
============================================================ */

export const getStudentsForInstructor = async (req, res) => {
  try {
    const { page = 1, limit = 20, courseId } = req.query;
    const skip = (page - 1) * limit;

    let coursesQuery = { instructor: req.user._id };
    if (courseId) coursesQuery._id = courseId;

    const courses = await Course.find(coursesQuery).select("_id title");
    const courseIds = courses.map((c) => c._id);

    if (!courseIds.length)
      return res.status(200).json({ success: true, students: [], total: 0, page: Number(page), limit: Number(limit) });

    const total = await Enrollment.countDocuments({ course: { $in: courseIds } });

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email")
      .populate("course", "title")
      .skip(skip)
      .limit(Number(limit));

    const students = enrollments.map((e) => ({
      _id: e.student._id,
      name: e.student.name,
      email: e.student.email,
      course: e.course.title,
    }));

    res.status(200).json({ success: true, students, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
};

/* ============================================================
   🎓 Available Courses for Students
============================================================ */

export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name email")
      .lean();

    const coursesWithUrls = courses.map((course) => ({
      ...course,
      image: course.image || "",
      content: Array.isArray(course.content)
        ? course.content.map((lesson) => ({
            ...lesson,
            url: lesson.url || "",
          }))
        : [],
    }));

    res.json({ courses: coursesWithUrls });
  } catch (err) {
    console.error("❌ Error fetching courses for students:", err);
    res.status(500).json({ success: false, message: "Failed to fetch courses for students" });
  }
};
