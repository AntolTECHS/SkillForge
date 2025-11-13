import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: null, // new field for course image
    content: [{ title: "", type: "text", file: null, contentText: "" }],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add a new lesson
  const handleAddLesson = () => {
    setCourse({
      ...course,
      content: [
        ...course.content,
        { title: "", type: "text", file: null, contentText: "" },
      ],
    });
  };

  // Remove a lesson
  const handleRemoveLesson = (index) => {
    const newContent = [...course.content];
    newContent.splice(index, 1);
    setCourse({ ...course, content: newContent });
  };

  // Update lesson fields
  const handleLessonChange = (index, field, value) => {
    const newContent = [...course.content];
    newContent[index][field] = value;
    setCourse({ ...course, content: newContent });
  };

  // Update lesson file
  const handleFileChange = (index, file) => {
    const newContent = [...course.content];
    newContent[index].file = file;
    setCourse({ ...course, content: newContent });
  };

  // Update course image
  const handleImageChange = (file) => {
    setCourse({ ...course, image: file });
  };

  // Submit course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append course info
      formData.append("title", course.title);
      formData.append("description", course.description);
      formData.append("price", course.price);
      formData.append("category", course.category);

      // Append course image if uploaded
      if (course.image) {
        formData.append("image", course.image);
      }

      // Prepare lesson content
      const lessonsWithoutFiles = course.content.map((lesson) => ({
        title: lesson.title,
        type: lesson.type,
        contentText: lesson.contentText || "",
      }));
      formData.append("content", JSON.stringify(lessonsWithoutFiles));

      // Append lesson files
      course.content.forEach((lesson) => {
        if (lesson.file) {
          formData.append("files", lesson.file);
        }
      });

      await axios.post("http://localhost:5000/api/courses", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/instructor/my-courses");
    } catch (err) {
      console.error("Failed to create course", err);
      alert("Failed to create course. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <form
        className="bg-white shadow rounded-xl p-6 space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Course Info */}
        <input
          type="text"
          placeholder="Course Title"
          value={course.title}
          onChange={(e) => setCourse({ ...course, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
        <textarea
          placeholder="Course Description"
          value={course.description}
          onChange={(e) =>
            setCourse({ ...course, description: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows="4"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Price"
            value={course.price}
            onChange={(e) => setCourse({ ...course, price: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={course.category}
            onChange={(e) =>
              setCourse({ ...course, category: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Course Image */}
        <div>
          <label className="block mb-2 font-medium">Course Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Lessons */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Course Lessons</h2>
          {course.content.map((lesson, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-4 mb-4 relative"
            >
              <input
                type="text"
                placeholder="Lesson Title"
                value={lesson.title}
                onChange={(e) =>
                  handleLessonChange(index, "title", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                required
              />
              <select
                value={lesson.type}
                onChange={(e) =>
                  handleLessonChange(index, "type", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 mb-2 w-full"
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>

              {lesson.type === "text" && (
                <textarea
                  placeholder="Lesson content"
                  value={lesson.contentText}
                  onChange={(e) =>
                    handleLessonChange(index, "contentText", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                  rows="4"
                  required
                />
              )}

              {(lesson.type === "video" || lesson.type === "pdf") && (
                <input
                  type="file"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  className="w-full mb-2"
                  required
                />
              )}

              {course.content.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLesson(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddLesson}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Add Lesson
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
