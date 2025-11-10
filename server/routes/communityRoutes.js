import express from "express";
import CommunityPost from "../models/CommunityPost.js";

const router = express.Router();

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new post
router.post("/", async (req, res) => {
  try {
    const { author, text, image } = req.body;
    const newPost = await CommunityPost.create({ author, text, image });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT like a post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST comment
router.post("/comment/:id", async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comment = req.body.comment;
    post.comments.push(comment);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
