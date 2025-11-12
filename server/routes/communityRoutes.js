// server/routes/communityRoutes.js
import express from "express";
import CommunityPost from "../models/CommunityPost.js";
import { protect, allowWeakAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * GET all posts with pagination and optional filtering
 * @access Logged-in users (even first-login instructors)
 * Query params:
 *   page     - page number (default: 1)
 *   limit    - number of posts per page (default: 20)
 *   author   - optional filter by author ID
 */
router.get("/", allowWeakAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.author) {
      filter.author = req.query.author;
    }

    const totalPosts = await CommunityPost.countDocuments(filter);
    const posts = await CommunityPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email"); // optional, include author info

    res.json({
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST create a new post
 * @access Private
 */
router.post("/", protect, async (req, res) => {
  try {
    const { text, image } = req.body;
    const author = req.user._id; // Use authenticated user as author
    const newPost = await CommunityPost.create({ author, text, image });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT like a post
 * @access Private
 */
router.put("/like/:id", protect, async (req, res) => {
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

/**
 * POST comment on a post
 * @access Private
 */
router.post("/comment/:id", protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = {
      author: req.user._id,
      text: req.body.comment,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
