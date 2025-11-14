import express from "express";
import path from "path";
import multer from "multer";
import {
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
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   🔒 Admin protection middleware
   ========================================================= */
router.use(protect, authorizeRoles("admin"));

/* =========================================================
   👩‍🏫 Instructor Management
   ========================================================= */
router.post("/instructors", addInstructor);
router.get("/instructors", getAllInstructors);
router.delete("/instructors/:id", deleteInstructor);

/* =========================================================
   👥 User Management
   ========================================================= */
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

/* =========================================================
   📚 Course Management
   ========================================================= */
router.get("/courses", getAllCourses);
router.delete("/courses/:id", deleteCourse);

/* =========================================================
   💳 Payment Management
   ========================================================= */
router.get("/payments", getAllPayments);

/* =========================================================
   🎓 Certificate Management
   ========================================================= */
router.get("/certificates", getAllCertificates);

/* =========================================================
   🧾 Enrollments
   ========================================================= */
router.get("/enrollments", getAllEnrollments);

/* =========================================================
   📊 Dashboard Overview
   ========================================================= */
router.get("/overview", getOverview);

/* =========================================================
   🖼 File Upload (Optional)
   ========================================================= */
const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
