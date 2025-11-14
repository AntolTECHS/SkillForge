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
        axios.get("http://localhost:5000/api/courses/available"),
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

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/enrollments",
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCoursesAndEnrollments();
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

  if (loading) {
    return (
      <div className="p-6 text-gray-500" style={rootFontStyle}>
        Loading your courses...
      </div>
    );
  }

  const enrolledIds = new Set(enrolled.map((c) => c._id));
  const recommended = courses.filter((c) => !enrolledIds.has(c._id));

  // === LESSON CONTENT VIEW ===
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

        {selectedLesson.type === "pdf" && selectedLesson.url && (
          <a
            href={selectedLesson.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View PDF
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

  // === LESSON LIST VIEW ===
  if (selectedCourse) {
    return (
      <div className="p-6" style={rootFontStyle}>
        <button
          onClick={handleBackToCourses}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Courses
        </button>

        {/* ✨ Styled Course Info Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100">
          {selectedCourse.image && (
            <img
              src={selectedCourse.image}
              alt={selectedCourse.title}
              className="w-full md:w-72 h-44 object-cover rounded-xl shadow-md mb-5"
            />
          )}

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCourse.title}
            </h1>
            <p className="text-gray-700 leading-relaxed">
              {selectedCourse.description}
            </p>
            <div className="pt-2">
              <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {selectedCourse.category || "General"}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300"></div>
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
                <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{lesson.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No lessons available yet.</p>
        )}
      </div>
    );
  }

  // === MAIN COURSE PAGE ===
  return (
    <div className="p-4 sm:p-6" style={rootFontStyle}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Explore Courses</h1>

      {/* Enrolled Modules */}
      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Enrolled Modules
        </h2>

        {enrolled.length === 0 ? (
          <p className="text-gray-500 italic">
            You haven’t enrolled in any modules yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {enrolled.map((course) => (
              <div
                key={course._id}
                onClick={() => handleStartCourse(course)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer w-full"
              >
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 truncate">
                    {course.title}
                  </h3>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {course.progress || 0}% Completed
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Courses */}
      <section className="mt-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Recommended for You
        </h2>

        {recommended.length === 0 ? (
          <p className="text-gray-500 italic">
            No other courses available right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {recommended.map((course) => (
              <div
                key={course._id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition w-full"
              >
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                    {course.description?.slice(0, 80) ||
                      "Learn more about this course."}
                  </p>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
                  >
                    Enroll Now
                  </button>
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
