// server/routes/adminRoutes.js

import express from "express";
import path from "path";
import multer from "multer";
import * as adminController from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   🔒 Middleware Protection
   ========================================================= */
router.use(protect, authorizeRoles("admin"));

/* =========================================================
   👩‍🏫 Instructor Management
   ========================================================= */
router.post("/instructors", adminController.addInstructor);
router.get("/instructors", adminController.getAllInstructors);
router.delete("/instructors/:id", adminController.deleteInstructor);

/* =========================================================
   👥 User Management
   ========================================================= */
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);

/* =========================================================
   📚 Course Management
   ========================================================= */
router.get("/courses", adminController.getAllCourses);
router.delete("/courses/:id", adminController.deleteCourse);

/* =========================================================
   💳 Payment Management
   ========================================================= */
router.get("/payments", adminController.getAllPayments);

/* =========================================================
   🎓 Certificate Management
   ========================================================= */
router.get("/certificates", adminController.getAllCertificates);

/* =========================================================
   📊 Dashboard Overview
   ========================================================= */
router.get("/overview", adminController.getOverview);

/* =========================================================
   🖼 File Upload (Optional)
   ========================================================= */
const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("✅ File uploaded:", req.file.filename);

  return res.json({ url: fileUrl });
});

/* =========================================================
   🧩 Export
   ========================================================= */
export default router;
