import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "https://skillforge-75b5.onrender.com";

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    thumbnail: null,
    content: [
      {
        title: "",
        type: "text",
        contentText: "",
        file: null,
        url: "",
        quiz: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // Fetch existing course
  useEffect(() => {
    const fetchCourse = async () => {
      setLoadingCourse(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");

        const res = await axios.get(`${API_URL}/api/instructor/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const courseData = res.data.course;
          const contentWithQuiz = (courseData.content || []).map((lesson) => ({
            ...lesson,
            quiz: lesson.quiz || [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
          }));

          setCourse({
            title: courseData.title,
            description: courseData.description,
            price: courseData.price,
            category: courseData.category,
            thumbnail: courseData.image || null,
            content: contentWithQuiz.map((lesson) => ({
              title: lesson.title,
              type: lesson.type,
              contentText: lesson.contentText || "",
              file: null,
              url: lesson.url || "",
              quiz: lesson.quiz,
            })),
          });
        }
      } catch (err) {
        console.error("Failed to fetch course", err?.response?.data || err.message);
        alert("Failed to fetch course data.");
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourse();
  }, [API_URL, courseId]);

  /** ------------------ Handlers (Lessons & Quiz) ------------------ **/
  const handleAddLesson = () => {
    setCourse((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        {
          title: "",
          type: "text",
          contentText: "",
          file: null,
          quiz: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
        },
      ],
    }));
  };

  const handleRemoveLesson = (index) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent.splice(index, 1);
      return { ...prev, content: newContent };
    });
  };

  const handleLessonChange = (index, field, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[index][field] = value;
      return { ...prev, content: newContent };
    });
  };

  const handleFileChange = (index, file) => handleLessonChange(index, "file", file);

  const handleAddQuestion = (lessonIndex) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIndex].quiz.push({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      });
      return { ...prev, content: newContent };
    });
  };

  const handleRemoveQuestion = (lessonIndex, questionIndex) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIndex].quiz.splice(questionIndex, 1);
      return { ...prev, content: newContent };
    });
  };

  const handleQuestionChange = (lessonIndex, questionIndex, field, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIndex].quiz[questionIndex][field] = value;
      return { ...prev, content: newContent };
    });
  };

  const handleOptionChange = (lessonIndex, questionIndex, optionIndex, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIndex].quiz[questionIndex].options[optionIndex] = value;
      return { ...prev, content: newContent };
    });
  };

  const handleCorrectAnswerChange = (lessonIndex, questionIndex, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIndex].quiz[questionIndex].correctAnswer = parseInt(value, 10);
      return { ...prev, content: newContent };
    });
  };

  const handleThumbnailChange = (file) => setCourse((prev) => ({ ...prev, thumbnail: file }));

  /** ------------------ Submit ------------------ **/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const formData = new FormData();
      ["title", "description", "price", "category"].forEach((field) => formData.append(field, course[field]));

      if (course.thumbnail instanceof File) formData.append("thumbnail", course.thumbnail);

      formData.append(
        "content",
        JSON.stringify(
          course.content.map(({ title, type, contentText, file, quiz }) => ({
            title,
            type,
            contentText,
            quiz: quiz.map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          }))
        )
      );

      course.content.forEach((lesson) => {
        if ((lesson.type === "video" || lesson.type === "pdf") && lesson.file) {
          formData.append("lessonFiles", lesson.file);
        }
      });

      await axios.put(`${API_URL}/api/instructor/courses/${courseId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      navigate("/instructor/my-courses");
    } catch (err) {
      console.error("Failed to update course", err?.response?.data || err.message);
      alert("Failed to update course. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCourse) return <div className="p-6 text-xl font-semibold">Loading course...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <form className="bg-white shadow rounded-xl p-6 space-y-6" onSubmit={handleSubmit}>
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
          onChange={(e) => setCourse({ ...course, description: e.target.value })}
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
            onChange={(e) => setCourse({ ...course, category: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block mb-2 font-medium">Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleThumbnailChange(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
          />
          {course.thumbnail && (
            <img
              src={course.thumbnail instanceof File ? URL.createObjectURL(course.thumbnail) : course.thumbnail}
              alt="Thumbnail Preview"
              className="mt-2 w-48 h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Lessons & Quiz (same as CreateCourse) */}
        {course.content.map((lesson, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 mb-4 relative">
            <input
              type="text"
              placeholder="Lesson Title"
              value={lesson.title}
              onChange={(e) => handleLessonChange(index, "title", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              required
            />
            <select
              value={lesson.type}
              onChange={(e) => handleLessonChange(index, "type", e.target.value)}
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
                onChange={(e) => handleLessonChange(index, "contentText", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                rows="4"
                required
              />
            )}

            {(lesson.type === "video" || lesson.type === "pdf") && (
              <>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  className="w-full mb-2"
                />
                {lesson.file && <p className="text-sm text-gray-600">Selected file: {lesson.file.name}</p>}
              </>
            )}

            {/* Quiz section omitted for brevity but same as CreateCourse */}
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Course"}
        </button>
      </form>
    </div>
  );
};

export default EditCourse;
