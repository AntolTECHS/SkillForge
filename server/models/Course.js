// server/models/Course.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["video", "pdf", "text"], default: "video" },
  url: { 
    type: String, 
    required: function () {
      return this.type !== "text"; // video/pdf require URL
    }
  },
  contentText: { 
    type: String, 
    required: function () {
      return this.type === "text"; // text lessons require contentText
    }
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String }, // new course image field
    content: [lessonSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
