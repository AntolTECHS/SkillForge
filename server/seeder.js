import mongoose from "mongoose";
import dotenv from "dotenv";
import CommunityUser from "./models/CommunityUser.js";
import Post from "./models/CommunityPost.js";
import Comment from "./models/Comment.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await CommunityUser.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // Create Community Users
    const users = await CommunityUser.insertMany([
      { name: "Amina K.", role: "student", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
      { name: "Sam O.", role: "mentor", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      { name: "Lina M.", role: "student", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      { name: "David R.", role: "student", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
    ]);

    // Create Posts
    const posts = await Post.insertMany([
      {
        author: users[0]._id,
        text: "Does anyone have tips for staying motivated in week 3 of the React course?",
        likes: 4,
      },
      {
        author: users[1]._id,
        text: "Shared a small code snippet for debouncing input — hope this helps!",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=60",
        likes: 12,
      },
    ]);

    // Create Comments
    const comment1 = await Comment.create({
      author: users[2]._id,
      text: "Break tasks into 20-min sprints — it helped me!",
    });
    posts[0].comments.push(comment1._id);
    await posts[0].save();

    console.log("✅ Community data seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
