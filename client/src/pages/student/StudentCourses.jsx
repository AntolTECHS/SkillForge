import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScores, setQuizScores] = useState({});
  const [overallScore, setOverallScore] = useState(null);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  useEffect(() => {
    if (!document.getElementById("gf-poppins")) {
      const link = document.createElement("link");
      link.id = "gf-poppins";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const fetchCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [coursesRes, enrollRes] = await Promise.all([
        axios.get(`${API_URL}/api/courses/available`),
        axios.get(`${API_URL}/api/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allCourses = Array.isArray(coursesRes.data.courses)
        ? coursesRes.data.courses
        : [];

      const enrolledCourses = (enrollRes.data.enrollments || []).map((e) => ({
        ...e.course,
        progress: e.progress || 0,
        hasPaid: e.hasPaid,
      }));

      setCourses(allCourses);
      setEnrolled(enrolledCourses);
    } catch (err) {
      console.error("Failed to load courses or enrollments", err);
      setCourses([]);
      setEnrolled([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndEnrollments();
    if (location.state?.refresh) {
      fetchCoursesAndEnrollments();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  const cacheBust = (url) => (url ? `${url}?v=${new Date().getTime()}` : "");

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/enrollments`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCoursesAndEnrollments();
    } catch (err) {
      console.error("Enrollment failed", err);
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    setQuizAnswers({});
    setQuizScores({});
    setOverallScore(null);
    setCurrentLessonIdx(0);
    setCurrentQuestionIdx(0);
  };

  const handleBackToCourses = () => setSelectedCourse(null);

  const handleAnswerSelect = (lessonIdx, questionIdx, optionIdx) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [lessonIdx]: { ...prev[lessonIdx], [questionIdx]: optionIdx },
    }));
  };

  const handleSubmitQuizzes = () => {
    if (!selectedCourse) return;

    let totalQuestions = 0;
    let totalCorrect = 0;
    const lessonScores = {};

    selectedCourse.content.forEach((lesson, lessonIdx) => {
      if (!lesson.quiz?.length) return;

      let lessonTotal = lesson.quiz.length;
      let lessonCorrect = 0;

      lesson.quiz.forEach((q, qIdx) => {
        if (quizAnswers[lessonIdx]?.[qIdx] === q.correctAnswer) lessonCorrect++;
      });

      lessonScores[lessonIdx] = {
        correct: lessonCorrect,
        total: lessonTotal,
        percentage: Math.round((lessonCorrect / lessonTotal) * 100),
        status: lessonCorrect === lessonTotal ? "completed" : "in-progress",
      };

      totalQuestions += lessonTotal;
      totalCorrect += lessonCorrect;
    });

    setQuizScores(lessonScores);
    setOverallScore(totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0);

    setEnrolled((prev) =>
      prev.map((c) =>
        c._id === selectedCourse._id
          ? { ...c, progress: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0 }
          : c
      )
    );
  };

  // ---------------- LESSON LIST VIEW ----------------
  if (selectedCourse) {
    return (
      <div className="p-6" style={rootFontStyle}>
        <button
          onClick={handleBackToCourses}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back to Courses
        </button>

        <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100">
          {selectedCourse.image && (
            <img
              src={cacheBust(selectedCourse.image)}
              alt={selectedCourse.title}
              className="w-full md:w-72 h-44 object-cover rounded-xl shadow-md mb-5"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{selectedCourse.title}</h1>
          <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
        </div>

        <h2 className="text-xl font-semibold mb-4">Lessons & Quizzes</h2>
        {selectedCourse.content?.length ? (
          <div className="space-y-4">
            {selectedCourse.content.map((lesson, lessonIdx) => {
              const lessonScore = quizScores[lessonIdx];
              const hasQuiz = lesson.quiz?.length;
              const status = lessonScore?.status
                ? lessonScore.status
                : hasQuiz
                ? "unattempted"
                : "no-quiz";

              return (
                <div key={lessonIdx} className="border p-4 rounded-xl bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {lesson.title || `Lesson ${lessonIdx + 1}`} ({lesson.type})
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        status === "completed"
                          ? "bg-green-100 text-green-700"
                          : status === "in-progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "unattempted"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {status === "no-quiz"
                        ? "No Quiz"
                        : status === "unattempted"
                        ? "Quiz Unattempted"
                        : status === "in-progress"
                        ? "Quiz In Progress"
                        : "Quiz Completed"}
                    </span>
                  </div>

                  {/* Lesson content */}
                  {lesson.type === "text" && lesson.contentText && (
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-white p-3 rounded-lg border mb-3">
                      {lesson.contentText}
                    </p>
                  )}

                  {/* Step-by-step quiz */}
                  {hasQuiz && currentLessonIdx === lessonIdx && (
                    <div className="mt-3 border p-3 rounded-lg bg-white">
                      <p className="font-medium text-gray-800">
                        {lesson.quiz[currentQuestionIdx].question}
                      </p>
                      <ul className="list-decimal ml-5 mt-2 text-gray-700">
                        {lesson.quiz[currentQuestionIdx].options.map((opt, i) => {
                          const selected =
                            quizAnswers[currentLessonIdx]?.[currentQuestionIdx] === i;
                          return (
                            <li
                              key={i}
                              className={`cursor-pointer hover:bg-gray-100 rounded px-1 ${
                                selected ? "font-semibold bg-gray-200" : ""
                              }`}
                              onClick={() =>
                                handleAnswerSelect(currentLessonIdx, currentQuestionIdx, i)
                              }
                            >
                              {opt} {selected ? " ✅" : ""}
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mt-3 flex justify-end gap-2">
                        {currentQuestionIdx < lesson.quiz.length - 1 && (
                          <button
                            onClick={() =>
                              setCurrentQuestionIdx((prev) => prev + 1)
                            }
                            disabled={
                              quizAnswers[currentLessonIdx]?.[currentQuestionIdx] ===
                              undefined
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            Next Question
                          </button>
                        )}
                        {currentQuestionIdx === lesson.quiz.length - 1 && (
                          <button
                            onClick={() => {
                              if (currentLessonIdx < selectedCourse.content.length - 1) {
                                setCurrentLessonIdx((prev) => prev + 1);
                                setCurrentQuestionIdx(0);
                              } else {
                                handleSubmitQuizzes();
                                setCurrentLessonIdx(0);
                                setCurrentQuestionIdx(0);
                              }
                            }}
                            disabled={
                              quizAnswers[currentLessonIdx]?.[currentQuestionIdx] ===
                              undefined
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            {currentLessonIdx < selectedCourse.content.length - 1
                              ? "Next Lesson"
                              : "Submit All Quizzes"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {status === "no-quiz" && (
                    <p className="text-gray-500 italic mt-2">No quiz for this lesson.</p>
                  )}
                </div>
              );
            })}

            {overallScore !== null && (
              <p className="mt-2 font-semibold text-gray-800">
                Overall Score: {overallScore}%
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No lessons available yet.</p>
        )}
      </div>
    );
  }

  // ---------------- MAIN PAGE ----------------
  const enrolledIds = new Set(enrolled.map((c) => c._id.toString()));
  const recommended = courses.filter((c) => !enrolledIds.has(c._id.toString()));

  return (
    <div className="p-4 sm:p-6" style={rootFontStyle}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Explore Courses</h1>

      {loading && <p className="text-gray-500">Loading courses...</p>}

      {/* Enrolled */}
      <section className="mb-12">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Enrolled Modules</h2>
        {enrolled.length === 0 ? (
          <p className="text-gray-500 italic">You haven’t enrolled in any courses yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {enrolled.map((course) => (
              <div
                key={course._id}
                onClick={() => handleStartCourse(course)}
                className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  {course.image && (
                    <img
                      src={cacheBust(course.image)}
                      alt={course.title}
                      className="w-20 h-20 object-cover rounded-xl shadow"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-2"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{course.progress || 0}% Completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Recommended for You</h2>
        {recommended.length === 0 ? (
          <p className="text-gray-500 italic">No other courses available right now.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recommended.map((course) => (
              <div
                key={course._id}
                className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg"
              >
                <div className="flex gap-4 items-center">
                  {course.image && (
                    <img
                      src={cacheBust(course.image)}
                      alt={course.title}
                      className="w-20 h-20 object-cover rounded-xl shadow"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {course.description?.slice(0, 90) || "Learn more about this course."}
                    </p>
                    <button
                      onClick={() => handleEnroll(course._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentCourses;
