// server/routes/adminRoutes.js
import express from "express";
import {
  addTeacher,
  getAllUsers,
  getAllTeachers,
  deleteUser,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Only Admin can access
router.use(protect, authorizeRoles("admin"));

router.post("/add-teacher", addTeacher);
router.get("/teachers", getAllTeachers);
router.get("/users", getAllUsers);
router.delete("/user/:id", deleteUser);

// ✅ Export router as default
export default router;
