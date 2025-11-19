// server/routes/courseRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getAvailableCourses,
  getCourseById,
} from "../controllers/courseController.js";

const router = express.Router();

// ------------------ Setup uploads folder ------------------
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ------------------ Multer storage ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${file.fieldname}-${timestamp}-${name}${ext}`);
  },
});

// ------------------ File filter ------------------
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|pdf|mov|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Unsupported file type!"));
};

// ------------------ Initialize multer ------------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
}).fields([
  { name: "thumbnail", maxCount: 1 },   // matches frontend
  { name: "lessonFiles", maxCount: 50 } // matches frontend
]);

// ------------------ Routes ------------------
router.post("/", protect, upload, createCourse);
router.get("/", protect, getCourses);
router.get("/available", getAvailableCourses);
router.get("/:id", getCourseById);

export default router;
