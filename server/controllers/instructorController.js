import Course from "../models/Course.js";

/* ============================================================
   📘 Create new course
   ============================================================ */
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    const instructorId = req.user._id;

    const course = await Course.create({
      title,
      description,
      thumbnail,
      instructor: instructorId,
    });

    res.status(201).json({ success: true, message: "Course created", course });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ success: false, message: "Error creating course" });
  }
};

/* ============================================================
   ✏️ Update existing course
   ============================================================ */
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructor: req.user._id },
      updates,
      { new: true }
    );

    if (!course) return res.status(404).json({ message: "Course not found or not yours" });

    res.status(200).json({ success: true, message: "Course updated", course });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ message: "Error updating course" });
  }
};

/* ============================================================
   🚀 Publish course
   ============================================================ */
export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructor: req.user._id },
      { isPublished: true },
      { new: true }
    );

    if (!course) return res.status(404).json({ message: "Course not found or not yours" });

    res.status(200).json({ success: true, message: "Course published!", course });
  } catch (err) {
    console.error("Error publishing course:", err);
    res.status(500).json({ message: "Error publishing course" });
  }
};

/* ============================================================
   🎓 Get instructor's own courses
   ============================================================ */
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};
