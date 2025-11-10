// models/CommunityUser.js
import mongoose from "mongoose";

const communityUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String }, // optional
  createdAt: { type: Date, default: Date.now }
});

const CommunityUser = mongoose.model("CommunityUser", communityUserSchema);
export default CommunityUser;
