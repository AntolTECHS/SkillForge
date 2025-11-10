import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET all posts (with author populated)
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
});

// CREATE new post
router.post("/", protect, async (req, res) => {
  try {
    const { text, image } = req.body;
    const post = await Post.create({
      text,
      image: image || null,
      author: req.user._id,
    });
    const populatedPost = await Post.findById(post._id)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar");
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: "Failed to create post", error: err.message });
  }
});

// LIKE / UNLIKE a post
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    if (!post.likedBy) post.likedBy = [];

    // Toggle like
    if (post.likedBy.includes(userId)) {
      post.likes = (post.likes || 1) - 1;
      post.likedBy = post.likedBy.filter((id) => id !== userId);
    } else {
      post.likes = (post.likes || 0) + 1;
      post.likedBy.push(userId);
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar");

    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: "Failed to like post", error: err.message });
  }
});

// COMMENT on a post
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ text, author: req.user._id });
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar");

    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: "Failed to comment", error: err.message });
  }
});

export default router;
