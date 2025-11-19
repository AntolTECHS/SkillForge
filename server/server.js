// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import multer from "multer";
import connectDB from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";

// ✅ Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import openRouterRoutes from "./routes/openRouterRoutes.js"; // SkillForge AI
import communityPostsRoutes from "./routes/posts.js";
import communityMembersRoutes from "./routes/members.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json({ limit: "50mb" })); // increased for large uploads
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Ensure uploads folder exists
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ✅ Serve uploads folder
app.use("/uploads", express.static(uploadsDir));

// ✅ Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Upload route (videos, PDFs, images)
app.post("/api/uploads", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 LearnSphere API is running...");
});

// ✅ Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/skillforge", openRouterRoutes);

// 🌐 Community page API
app.use("/api/community/posts", communityPostsRoutes);
app.use("/api/community/members", communityMembersRoutes);

// ✅ Global error handler
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
