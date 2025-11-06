import User from "../models/User.js";

export const hasCourseAccess = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { courseId } = req.params;

  const enrollment = user.enrolledCourses.find(
    (e) => e.course.toString() === courseId
  );

  if (!enrollment) {
    return res.status(403).json({ message: "Not enrolled in this course" });
  }

  const now = new Date();
  if (enrollment.hasPaid || now <= enrollment.trialExpiresAt) {
    return next(); // ✅ Allow access
  } else {
    return res.status(403).json({
      message: "Your free trial has expired. Please make payment to continue.",
    });
  }
};
