import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const pageFont = {
    fontFamily: "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    category: "",
    level: "",
    duration: "",
    content: [],
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [lessonFiles, setLessonFiles] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/instructor/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          const courseData = res.data.course;
          const contentWithQuiz = (courseData.content || []).map((lesson) => ({
            ...lesson,
            quiz: lesson.quiz || [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
          }));
          setCourse({ ...courseData, content: contentWithQuiz });
        } else {
          alert("Course not found or access denied");
          navigate("/instructor/my-courses");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load course");
        navigate("/instructor/my-courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleLessonFileChange = (e, idx) => {
    const file = e.target.files[0];
    setLessonFiles((prev) => ({ ...prev, [idx]: file }));
  };

  const handleLessonChange = (idx, field, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[idx][field] = value;
      return { ...prev, content: newContent };
    });
  };

  const addLesson = () => {
    setCourse((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        {
          title: "",
          type: "text",
          contentText: "",
          quiz: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
        },
      ],
    }));
  };

  const removeLesson = (idx) => {
    setCourse((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== idx),
    }));
    setLessonFiles((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
  };

  /** ------------------ Lesson Quiz Handlers ------------------ **/
  const handleAddQuestion = (lessonIdx) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIdx].quiz.push({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
      return { ...prev, content: newContent };
    });
  };

  const handleRemoveQuestion = (lessonIdx, qIdx) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIdx].quiz = newContent[lessonIdx].quiz.filter((_, i) => i !== qIdx);
      return { ...prev, content: newContent };
    });
  };

  const handleQuestionChange = (lessonIdx, qIdx, field, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIdx].quiz[qIdx][field] = value;
      return { ...prev, content: newContent };
    });
  };

  const handleOptionChange = (lessonIdx, qIdx, optIdx, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIdx].quiz[qIdx].options[optIdx] = value;
      return { ...prev, content: newContent };
    });
  };

  const handleCorrectAnswerChange = (lessonIdx, qIdx, value) => {
    setCourse((prev) => {
      const newContent = [...prev.content];
      newContent[lessonIdx].quiz[qIdx].correctAnswer = parseInt(value, 10);
      return { ...prev, content: newContent };
    });
  };

  /** ------------------ Submit ------------------ **/
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Basic fields
      ["title", "description", "price", "category", "level", "duration"].forEach((field) =>
        formData.append(field, course[field])
      );

      // Thumbnail
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      // Only include filled quiz questions
      const contentToSend = course.content.map((lesson) => {
        const filteredQuiz = (lesson.quiz || []).filter(
          (q) => q.question.trim() !== "" || q.options.some((opt) => opt.trim() !== "")
        );
        return { ...lesson, quiz: filteredQuiz };
      });

      formData.append("content", JSON.stringify(contentToSend));

      // Lesson files
      Object.keys(lessonFiles).forEach((idx) => {
        formData.append("lessonFiles", lessonFiles[idx]);
      });

      const res = await axios.put(
        `http://localhost:5000/api/instructor/courses/${courseId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Course updated successfully!");
        navigate("/instructor/my-courses");
      } else {
        alert(res.data.message || "Failed to update course");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error updating course");
    }
  };

  if (loading) return <div className="p-6 text-xl font-semibold">Loading course...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto" style={pageFont}>
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* COURSE DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="title" value={course.title} onChange={handleChange} placeholder="Course Title" className="border rounded px-3 py-2" required />
          <input type="text" name="category" value={course.category} onChange={handleChange} placeholder="Category" className="border rounded px-3 py-2" />
          <input type="number" name="price" value={course.price} onChange={handleChange} placeholder="Price" className="border rounded px-3 py-2" min={0} required />
          <input type="text" name="level" value={course.level} onChange={handleChange} placeholder="Level" className="border rounded px-3 py-2" />
          <input type="text" name="duration" value={course.duration} onChange={handleChange} placeholder="Duration" className="border rounded px-3 py-2" />
        </div>

        <div>
          <textarea name="description" value={course.description} onChange={handleChange} placeholder="Course Description" className="border w-full rounded px-3 py-2" rows={4} required />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="font-medium">Thumbnail</label>
          <input type="file" onChange={handleThumbnailChange} className="w-full mb-2" />
          {course.thumbnail && <img src={`http://localhost:5000/uploads/${course.thumbnail}`} alt="Thumbnail" className="w-40 h-28 object-cover border rounded" />}
        </div>

        {/* LESSONS */}
        <div>
          <h2 className="text-xl font-bold mb-2">Lessons</h2>
          {course.content.map((lesson, idx) => (
            <div key={idx} className="border p-4 rounded mb-4">
              <input type="text" placeholder="Lesson title" value={lesson.title} onChange={(e) => handleLessonChange(idx, "title", e.target.value)} className="w-full border rounded px-2 py-1 mb-2" />
              <select value={lesson.type} onChange={(e) => handleLessonChange(idx, "type", e.target.value)} className="w-full border rounded px-2 py-1 mb-2">
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="file">File</option>
              </select>
              {lesson.type !== "text" && <input type="file" onChange={(e) => handleLessonFileChange(e, idx)} className="mb-2" />}

              {/* Lesson Quiz */}
              <div className="mt-2">
                <h3 className="font-semibold mb-2">Lesson Quiz</h3>
                {lesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="border p-2 mb-2 rounded">
                    <input type="text" placeholder="Question" value={q.question} onChange={(e) => handleQuestionChange(idx, qIdx, "question", e.target.value)} className="w-full border rounded px-2 py-1 mb-1" />
                    {q.options.map((opt, optIdx) => (
                      <input key={optIdx} type="text" placeholder={`Option ${optIdx+1}`} value={opt} onChange={(e) => handleOptionChange(idx, qIdx, optIdx, e.target.value)} className="w-full border rounded px-2 py-1 mb-1" />
                    ))}
                    <select value={q.correctAnswer} onChange={(e) => handleCorrectAnswerChange(idx, qIdx, e.target.value)} className="w-full border rounded px-2 py-1 mb-1">
                      {q.options.map((_, optIdx) => <option key={optIdx} value={optIdx}>Correct Answer: Option {optIdx+1}</option>)}
                    </select>
                    {lesson.quiz.length > 1 && <button type="button" onClick={() => handleRemoveQuestion(idx, qIdx)} className="text-red-600 mt-1">Remove Question</button>}
                  </div>
                ))}
                <button type="button" onClick={() => handleAddQuestion(idx)} className="bg-blue-500 text-white px-3 py-1 rounded mb-1">+ Add Question</button>
              </div>

              <button type="button" onClick={() => removeLesson(idx)} className="text-red-600 mt-2">Remove Lesson</button>
            </div>
          ))}
          <button type="button" onClick={addLesson} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Lesson</button>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mt-6">Update Course</button>
      </form>
    </div>
  );
};

export default EditCourse;
