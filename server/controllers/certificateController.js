import Course from "../models/Course.js";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import generateCertificate from "../utils/generateCertificate.js";

/**
 * Issue certificate for a student (admin/teacher could also trigger)
 * POST /api/certificates/issue
 * Body: { studentId, courseId }
 */
export const issueCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await User.findById(studentId);
    const course = await Course.findById(courseId).populate("instructor", "name");

    if (!student || !course) return res.status(404).json({ message: "Student or course not found" });

    // optionally verify completion
    if (!course.students.includes(studentId))
      return res.status(403).json({ message: "Student not enrolled in course" });

    const certificateUrl = await generateCertificate({
      studentName: student.name,
      courseTitle: course.title,
      instructorName: course.instructor.name,
    });

    const cert = await Certificate.create({
      student: studentId,
      course: courseId,
      certificateUrl,
    });

    res.status(201).json({ certificate: cert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Download or get certificate by id
 * GET /api/certificates/:id
 */
export const getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate("student", "name").populate("course", "title");
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.status(200).json(cert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  issueCertificate,
  getCertificate,
};
