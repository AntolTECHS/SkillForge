// server/routes/authRoutes.js
import express from "express";
import {
  registerStudent,
  loginUser,
  changePassword,
  getMe,
} from "../controllers/authController.js";
import { protect, allowWeakAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @desc  Register a new student account
 * @route POST /api/auth/register
 * @access Public
 */
router.post("/register", registerStudent);

/**
 * @desc  Log in any user (student/instructor/admin)
 * @route POST /api/auth/login
 * @access Public
 */
router.post("/login", loginUser);

/**
 * @desc  Change password (for users on first login or forced password change)
 * @route PUT|POST /api/auth/change-password
 * @access Private (weak)
 */
["put", "post"].forEach((method) => {
  router[method]("/change-password", allowWeakAuth, changePassword);
});

/**
 * @desc  Get current logged-in user info
 * @route GET /api/auth/me
 * @access Private (normal)
 */
router.get("/me", protect, getMe);

export default router;
