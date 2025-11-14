import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: null,
    content: [{ title: "", type: "text", file: null, contentText: "" }],
    quizzes: [
      {
        title: "",
        questions: [
          { question: "", options: ["", "", "", ""], correctAnswer: 0 },
        ],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Apply Poppins font manually to this page
  const pageFont = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  /** ------------------ Lesson Handlers ------------------ **/
  const handleAddLesson = () => {
    setCourse({
      ...course,
      content: [
        ...course.content,
        { title: "", type: "text", file: null, contentText: "" },
      ],
    });
  };

  const handleRemoveLesson = (index) => {
    const newContent = [...course.content];
    newContent.splice(index, 1);
    setCourse({ ...course, content: newContent });
  };

  const handleLessonChange = (index, field, value) => {
    const newContent = [...course.content];
    newContent[index][field] = value;
    setCourse({ ...course, content: newContent });
  };

  const handleFileChange = (index, file) => {
    const newContent = [...course.content];
    newContent[index].file = file;
    setCourse({ ...course, content: newContent });
  };

  /** ------------------ Quiz Handlers ------------------ **/
  const handleAddQuiz = () => {
    setCourse({
      ...course,
      quizzes: [
        ...course.quizzes,
        {
          title: "",
          questions: [
            { question: "", options: ["", "", "", ""], correctAnswer: 0 },
          ],
        },
      ],
    });
  };

  const handleRemoveQuiz = (index) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes.splice(index, 1);
    setCourse({ ...course, quizzes: newQuizzes });
  };

  const handleQuizTitleChange = (index, value) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[index].title = value;
    setCourse({ ...course, quizzes: newQuizzes });
  };

  const handleAddQuestion = (quizIndex) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[quizIndex].questions.push({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setCourse({ ...course, quizzes: newQuizzes });
  };

  const handleRemoveQuestion = (quizIndex, questionIndex) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[quizIndex].questions.splice(questionIndex, 1);
    setCourse({ ...course, quizzes: newQuizzes });
  };

  const handleQuestionChange = (quizIndex, questionIndex, field, value) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[quizIndex].questions[questionIndex][field] = value;
    setCourse({ ...course, quizzes: newQuizzes });
  };

  const handleOptionChange = (quizIndex, questionIndex, optionIndex, value) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[quizIndex].questions[questionIndex].options[optionIndex] = value;
    setCourse({ ...course, quizzes: newQuizzes });
  };

  const handleCorrectAnswerChange = (quizIndex, questionIndex, value) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[quizIndex].questions[questionIndex].correctAnswer =
      parseInt(value, 10);
    setCourse({ ...course, quizzes: newQuizzes });
  };

  /** ------------------ Image Handler ------------------ **/
  const handleImageChange = (file) => {
    setCourse({ ...course, image: file });
  };

  /** ------------------ Submit ------------------ **/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", course.title);
      formData.append("description", course.description);
      formData.append("price", course.price);
      formData.append("category", course.category);

      if (course.image) formData.append("image", course.image);

      formData.append("content", JSON.stringify(course.content));
      formData.append("quizzes", JSON.stringify(course.quizzes));

      course.content.forEach((lesson) => {
        if (
          (lesson.type === "video" || lesson.type === "pdf") &&
          lesson.file
        ) {
          formData.append(`files`, lesson.file);
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
    <div className="max-w-5xl mx-auto p-6" style={pageFont}>
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
            onChange={(e) =>
              setCourse({ ...course, price: e.target.value })
            }
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
                    handleLessonChange(
                      index,
                      "contentText",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                  rows="4"
                  required
                />
              )}

              {(lesson.type === "video" || lesson.type === "pdf") && (
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(index, e.target.files[0])
                  }
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mb-4"
          >
            + Add Lesson
          </button>
        </div>

        {/* Quizzes */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Quizzes</h2>

          {course.quizzes.map((quiz, quizIndex) => (
            <div
              key={quizIndex}
              className="border border-gray-200 rounded-xl p-4 mb-4 relative"
            >
              <input
                type="text"
                placeholder="Quiz Title"
                value={quiz.title}
                onChange={(e) =>
                  handleQuizTitleChange(quizIndex, e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                required
              />

              {quiz.questions.map((q, questionIndex) => (
                <div
                  key={questionIndex}
                  className="border p-3 mb-2 rounded-lg"
                >
                  <input
                    type="text"
                    placeholder="Question"
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionChange(
                        quizIndex,
                        questionIndex,
                        "question",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1"
                    required
                  />

                  {q.options.map((opt, optIndex) => (
                    <input
                      key={optIndex}
                      type="text"
                      placeholder={`Option ${optIndex + 1}`}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(
                          quizIndex,
                          questionIndex,
                          optIndex,
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1"
                      required
                    />
                  ))}

                  <select
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleCorrectAnswerChange(
                        quizIndex,
                        questionIndex,
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1"
                  >
                    {q.options.map((_, optIndex) => (
                      <option key={optIndex} value={optIndex}>
                        Correct Answer: Option {optIndex + 1}
                      </option>
                    ))}
                  </select>

                  {quiz.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveQuestion(
                          quizIndex,
                          questionIndex
                        )
                      }
                      className="text-red-600 hover:text-red-800 mt-1"
                    >
                      Remove Question
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddQuestion(quizIndex)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg mb-2"
              >
                + Add Question
              </button>

              {course.quizzes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuiz(quizIndex)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                >
                  Remove Quiz
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg mb-4"
          >
            + Add Quiz
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
