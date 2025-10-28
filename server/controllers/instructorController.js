// server/controllers/instructorController.js

import User from "../models/User.js";
import Course from "../models/Course.js";
import cloudinary from "../config/cloudinary.js";

/**
 * @desc    Add a new instructor (Admin only)
 * @route   POST /api/admin/instructors
 * @access  Private (Admin)
 */
export const addInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if instructor already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Instructor with this email already exists" });
    }

    const instructor = await User.create({
      name,
      email,
      password,
      role: "instructor",
    });

    res.status(201).json({
      message: "Instructor added successfully",
      instructor: {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding instructor", error: error.message });
  }
};

/**
 * @desc    Get all instructors
 * @route   GET /api/admin/instructors
 * @access  Private (Admin)
 */
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select("-password");
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructors", error: error.message });
  }
};

/**
 * @desc    Delete an instructor (Admin only)
 * @route   DELETE /api/admin/instructors/:id
 * @access  Private (Admin)
 */
export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await User.findById(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    if (instructor.role !== "instructor") {
      return res.status(400).json({ message: "User is not an instructor" });
    }

    await Course.deleteMany({ teacher: id }); // Clean up their courses
    await instructor.deleteOne();

    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting instructor", error: error.message });
  }
};

/**
 * @desc    Update instructor profile (Instructor or Admin)
 * @route   PUT /api/instructors/:id
 * @access  Private (Instructor/Admin)
 */
export const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only admin or the instructor themselves can update
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized to update this instructor" });
    }

    const updatedInstructor = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!updatedInstructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      message: "Instructor updated successfully",
      instructor: updatedInstructor,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating instructor", error: error.message });
  }
};

/**
 * @desc    Get instructor details by ID
 * @route   GET /api/instructors/:id
 * @access  Private (Admin or Instructor)
 */
export const getInstructorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Admins can fetch any instructor, instructors only themselves
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const instructor = await User.findById(id).select("-password");
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json(instructor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructor", error: error.message });
  }
};

/**
 * @desc    Upload instructor profile image
 * @route   PUT /api/instructors/:id/avatar
 * @access  Private (Instructor or Admin)
 */
export const uploadInstructorAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "instructors",
    });

    const instructor = await User.findByIdAndUpdate(
      id,
      { avatar: result.secure_url },
      { new: true }
    ).select("-password");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      message: "Avatar uploaded successfully",
      instructor,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading avatar", error: error.message });
  }
};
