// scripts/seedCourseraCourses.js
import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Course from "../models/Course.js";

dotenv.config();

const COURSERA_API =
  "https://api.coursera.org/api/courses.v1?limit=20&fields=slug,description,photoUrl,partnerIds";

const seedCourseraCourses = async () => {
  try {
    // connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // fetch Coursera courses
    const { data } = await axios.get(COURSERA_API);
    const courses = data.elements.map((c) => ({
      title: c.name,
      description: c.description || "No description provided.",
      category: "Online Learning",
      price: 0,
      thumbnail: c.photoUrl || "",
      externalUrl: `https://www.coursera.org/learn/${c.slug}`,
      instructor: null,
      lessons: [],
      quizzes: [],
    }));

    // insert courses into database
    await Course.insertMany(courses);
    console.log(`✅ Imported ${courses.length} Coursera courses successfully!`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding Coursera courses:", err.message);
    process.exit(1);
  }
};

seedCourseraCourses();
