// server/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";

// ✅ Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js"; // 🆕 Added enrollment routes

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Proper CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend port
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Serve uploads statically
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 LearnSphere API is running...");
});

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/enrollments", enrollmentRoutes); // 🆕 Added

// ✅ Error handling middleware
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
