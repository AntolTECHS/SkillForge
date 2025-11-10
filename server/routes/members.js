import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET all members
router.get("/", async (req, res) => {
  try {
    const members = await User.find().select("name avatar role");
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch members", error: err.message });
  }
});

export default router;
