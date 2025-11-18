// server/routes/instructorRoutes.js
import express from "express";
import multer from "multer";
import {
  createCourse,
  updateCourse,
  togglePublishCourse, // updated
  deleteCourse,
  getMyCourses,
  getCourseById,
  addQuiz,
  getStudentsForInstructor,
  getProfile,
  updateProfile,
} from "../controllers/instructorController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// -------------------- Multer Setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// -------------------- PROFILE ROUTES --------------------
router.get("/profile", protect, authorizeRoles("instructor"), getProfile);
router.put("/profile", protect, authorizeRoles("instructor"), updateProfile);

// -------------------- COURSE ROUTES --------------------
router.post(
  "/courses",
  protect,
  authorizeRoles("instructor"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lessonFiles" },
  ]),
  createCourse
);

router.put(
  "/courses/:courseId",
  protect,
  authorizeRoles("instructor"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lessonFiles" },
  ]),
  updateCourse
);

router.delete(
  "/courses/:courseId",
  protect,
  authorizeRoles("instructor"),
  deleteCourse
);

router.patch(
  "/courses/:courseId/status",
  protect,
  authorizeRoles("instructor"),
  togglePublishCourse // ✅ matches the controller
);

router.post(
  "/courses/:courseId/quizzes",
  protect,
  authorizeRoles("instructor"),
  addQuiz
);

// -------------------- INSTRUCTOR'S COURSES & STUDENTS --------------------
router.get("/my-courses", protect, authorizeRoles("instructor"), getMyCourses);
router.get("/students", protect, authorizeRoles("instructor"), getStudentsForInstructor);
router.get("/courses/:courseId", protect, authorizeRoles("instructor"), getCourseById);

export default router;
