import express from "express";
import { registerStudent, loginUser, changePassword } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent); // Students only
router.post("/login", loginUser);
router.put("/change-password", protect, changePassword);

export default router;
