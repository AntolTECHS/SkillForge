import express from "express";
import axios from "axios";
import Chat from "../models/Chat.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/history", protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id });
    res.json({ messages: chat?.messages || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

router.post("/chat", protect, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI tutor for students." },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiText = response.data.choices?.[0]?.message?.content || "No response.";

    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) chat = new Chat({ user: req.user._id, messages: [] });

    chat.messages.push({ from: "user", text: message });
    chat.messages.push({ from: "ai", text: aiText });
    await chat.save();

    res.json({ reply: aiText });
  } catch (err) {
    console.error("SkillForge AI Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
});

export default router;
