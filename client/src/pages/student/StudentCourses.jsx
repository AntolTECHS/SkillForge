import { useState, useEffect } from "react";
import axios from "axios";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  // Load Poppins font dynamically
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

  // Fetch all published courses and enrollments
  const fetchCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [coursesRes, enrollRes] = await Promise.all([
        axios.get("http://localhost:5000/api/courses/available"), // published courses
        axios.get("http://localhost:5000/api/enrollments", {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, []);

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/enrollments",
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCoursesAndEnrollments(); // refresh after enrollment
    } catch (err) {
      console.error("Failed to enroll", err);
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
  };

  // === LESSON PAGE ===
  if (selectedCourse && selectedLesson) {
    return (
      <div className="p-6" style={rootFontStyle}>
        <button
          onClick={handleBackToLessons}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Lessons
        </button>

        <h1 className="text-2xl font-bold mb-4">{selectedLesson.title}</h1>

        {selectedLesson.type === "video" && selectedLesson.url && (
          <video
            src={selectedLesson.url}
            controls
            className="w-full rounded-xl shadow-md"
          />
        )}

        {selectedLesson.type === "file" && selectedLesson.url && (
          <a
            href={selectedLesson.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View File
          </a>
        )}

        {selectedLesson.type === "text" && selectedLesson.contentText && (
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border">
            {selectedLesson.contentText}
          </p>
        )}
      </div>
    );
  }

  // === LESSON LIST ===
  if (selectedCourse) {
    return (
      <div className="p-6" style={rootFontStyle}>
        <button
          onClick={handleBackToCourses}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Courses
        </button>

        <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100">
          {selectedCourse.image && (
            <img
              src={selectedCourse.image}
              alt={selectedCourse.title}
              className="w-full md:w-72 h-44 object-cover rounded-xl shadow-md mb-5"
            />
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {selectedCourse.title}
          </h1>
          <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>

          <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300" />
        </div>

        <h2 className="text-xl font-semibold mb-4">Course Lessons</h2>
        {selectedCourse.content?.length ? (
          <div className="space-y-3">
            {selectedCourse.content.map((lesson, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLesson(lesson)}
                className="p-4 bg-gray-50 rounded-xl border cursor-pointer hover:bg-gray-100 transition"
              >
                <h3 className="font-semibold text-gray-800">{lesson.title || `Lesson ${idx + 1}`}</h3>
                <p className="text-sm text-gray-500">{lesson.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No lessons available yet.</p>
        )}

        <h2 className="text-xl font-semibold mt-6 mb-4">Quizzes</h2>
        {selectedCourse.quizzes?.length ? (
          <div className="space-y-3">
            {selectedCourse.quizzes.map((quiz, qIdx) => (
              <div key={qIdx} className="p-4 bg-gray-50 rounded-xl border">
                <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                <ul className="list-disc ml-6 mt-2">
                  {quiz.questions.map((question, idx) => (
                    <li key={idx} className="text-gray-700">{question.question}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No quizzes available yet.</p>
        )}
      </div>
    );
  }

  // === MAIN PAGE ===
  const enrolledIds = new Set(enrolled.map((c) => c._id));
  const recommended = courses.filter((c) => !enrolledIds.has(c._id));

  return (
    <div className="p-4 sm:p-6" style={rootFontStyle}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Explore Courses</h1>

      {/* ENROLLED COURSES */}
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
                className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-20 h-20 object-cover rounded-xl shadow"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-2" style={{ width: `${course.progress || 0}%` }} />
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{course.progress || 0}% Completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECOMMENDED COURSES */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Recommended for You</h2>

        {recommended.length === 0 ? (
          <p className="text-gray-500 italic">No other courses available right now.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recommended.map((course) => (
              <div
                key={course._id}
                className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex gap-4 items-center">
                  {course.image && (
                    <img
                      src={course.image}
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
