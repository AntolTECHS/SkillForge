// fixInstructors.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; // adjust path if needed

const MONGO_URI = "mongodb://127.0.0.1:27017/yourdbname"; // replace with your DB

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

async function fixInstructors() {
  const instructors = await User.find({ role: "instructor" });

  for (const user of instructors) {
    let updated = false;

    // 1️⃣ Ensure permanent password is hashed
    if (!user.password || !(user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$"))) {
      if (!user.password) {
        user.password = "Instructor123"; // default permanent password
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      updated = true;
      console.log(`✅ Permanent password hashed for: ${user.email}`);
    }

    // 2️⃣ If temp password exists or forcePasswordChange is true, reset temp password
    if (!user.tempPasswordHash || user.forcePasswordChange) {
      user.setTempPassword("Temp1234", 7); // 7-day temp password
      updated = true;
      console.log(`🔑 Temp password set for: ${user.email}`);
    }

    // 3️⃣ Ensure account is active
    if (!user.isActive) {
      user.isActive = true;
      updated = true;
      console.log(`✅ Account reactivated: ${user.email}`);
    }

    if (updated) await user.save();
  }

  console.log("✅ All instructors fixed. Use Temp1234 as temporary password to log in.");
  process.exit();
}

fixInstructors();
