import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { initiatePayment, mpesaCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", protect, initiatePayment); // Student-initiated
router.post("/mpesa-callback", mpesaCallback); // M-Pesa server webhook

export default router;
