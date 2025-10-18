// controllers/adminController.js
import User from "../models/User.js";
import { generateRandomPassword } from "../utils/randomPassword.js";
import { sendEmail } from "../utils/sendEmail.js";

// Add a teacher
export const addTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    const password = generateRandomPassword();
    const teacher = await User.create({
      name,
      email,
      role: "teacher",
      password,
    });

    // Optionally, send email with password
    await sendEmail(email, "Your account has been created", `Password: ${password}`);

    res.status(201).json({ message: "Teacher created", teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
  const teachers = await User.find({ role: "teacher" });
  res.json(teachers);
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: "User deleted" });
};
