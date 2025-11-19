// server/routes/certificateRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  issueCertificate,
  getCertificate,
  getMyCertificates
} from "../controllers/certificateController.js";

const router = express.Router();

// Get all certificates for logged-in student
router.get("/me", protect, getMyCertificates);

// Issue certificate (Admin/Instructor)
router.post("/issue", protect, issueCertificate);

// Get certificate by ID
router.get("/:id", protect, getCertificate);

export default router;
