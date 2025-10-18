import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { initiatePayment, handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Protect user-initiated payments
router.use(protect);

// Create payment
router.post("/initiate", initiatePayment);

// Webhook (public)
router.post("/webhook", express.json(), handleWebhook);

export default router;
