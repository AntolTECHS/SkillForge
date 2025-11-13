import express from "express";
import { createCourse, getCourses, getAvailableCourses } from "../controllers/courseController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Setup uploads folder
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// Accept course image + lesson files
const upload = multer({ storage }).fields([
  { name: "image", maxCount: 1 },  // course image
  { name: "files" },               // lesson files
]);

// Routes
router.post("/", protect, upload, createCourse);
router.get("/", getCourses);
router.get("/available", getAvailableCourses);

export default router;
