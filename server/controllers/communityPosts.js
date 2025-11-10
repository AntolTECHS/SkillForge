import CommunityPost from "../models/CommunityPost.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).populate("author", "name avatar");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text, image, authorId } = req.body;
    if (!text) return res.status(400).json({ error: "Post text required" });

    const newPost = await CommunityPost.create({
      text,
      image: image || null,
      author: authorId,
    });

    const post = await newPost.populate("author", "name avatar");
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.likes = (post.likes || 0) + 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.comments.push(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
