// pages/InstructorDashboard.jsx
import { useState } from "react";
import axios from "axios";

const InstructorDashboard = () => {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    image: "",
    duration: "",
  });

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.post("http://localhost:5000/api/courses", courseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Course created successfully!");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-sky-600">Create New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="title"
          placeholder="Course title"
          className="border w-full p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="description"
          placeholder="Description"
          className="border w-full p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="image"
          placeholder="Image URL"
          className="border w-full p-2 rounded"
          onChange={handleChange}
        />
        <input
          name="duration"
          placeholder="Duration"
          className="border w-full p-2 rounded"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          Publish Course
        </button>
      </form>
    </div>
  );
};

export default InstructorDashboard;
