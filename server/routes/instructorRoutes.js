// server/routes/instructorRoutes.js
import express from "express";
import multer from "multer";
import {
  createCourse,
  updateCourse,
  publishCourse,
  getMyCourses,
  getCourseById,
  addQuiz,
  deleteCourse,
  getStudentsForInstructor,
  getProfile,
  updateProfile,
} from "../controllers/instructorController.js";

import { protect, allowWeakAuth } from "../middlewares/authMiddleware.js";
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

// -------------------- PROTECTED ROUTES --------------------
// Full authentication required + instructor role
router.post("/courses", protect, authorizeRoles("instructor"), createCourse);

router.put(
  "/courses/:courseId",
  protect,
  authorizeRoles("instructor"),
  upload.single("thumbnail"),
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
  publishCourse
);

router.post(
  "/courses/:courseId/quizzes",
  protect,
  authorizeRoles("instructor"),
  addQuiz
);

// -------------------- PROFILE ROUTES --------------------
router.get("/profile", protect, authorizeRoles("instructor"), getProfile);
router.put("/profile", protect, authorizeRoles("instructor"), updateProfile);

// -------------------- WEAK AUTH ROUTES --------------------
// Allow access even if first-login or forcePasswordChange
router.get("/my-courses", allowWeakAuth, getMyCourses);
router.get("/students", allowWeakAuth, getStudentsForInstructor);
router.get("/courses/:courseId", allowWeakAuth, getCourseById);

export default router;
