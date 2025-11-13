import { useState, useEffect } from "react";
import axios from "axios";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  // Load Google font once
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

  // Fetch all available and enrolled courses
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
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500" style={rootFontStyle}>
        Loading your courses...
      </div>
    );
  }

  // Determine courses not enrolled in
  const enrolledIds = new Set(enrolled.map((c) => c._id));
  const recommended = courses.filter((c) => !enrolledIds.has(c._id));

  // Course detail page
  if (selectedCourse) {
    return (
      <div className="p-6" style={rootFontStyle}>
        <button
          onClick={() => setSelectedCourse(null)}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg"
        >
          ← Back to Courses
        </button>

        <div className="flex flex-col md:flex-row items-start gap-6 mb-6 border rounded-2xl p-6 bg-white shadow-md">
          {selectedCourse.image && (
            <img
              src={selectedCourse.image}
              alt={selectedCourse.title}
              className="w-full md:w-64 h-40 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
            <p className="text-gray-700">{selectedCourse.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {selectedCourse.content?.map((lesson, idx) => (
            <div
              key={`${selectedCourse._id}-${idx}`}
              className="border p-4 rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{lesson.title}</h2>
                <span className="text-sm text-gray-500">{lesson.type}</span>
              </div>

              {lesson.type === "video" && lesson.url && (
                <video src={lesson.url} controls className="w-full rounded" />
              )}
              {lesson.type === "pdf" && lesson.url && (
                <a
                  href={lesson.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View PDF
                </a>
              )}
              {lesson.type === "text" && lesson.contentText && (
                <p className="whitespace-pre-wrap">{lesson.contentText}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main “Explore Courses” Page
  return (
    <div className="p-4 sm:p-6" style={rootFontStyle}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Explore Courses</h1>

      {/* Enrolled Modules */}
      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Enrolled Modules</h2>

        {enrolled.length === 0 ? (
          <p className="text-gray-500 italic">
            You haven’t enrolled in any modules yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {enrolled.map((course) => (
              <div
                key={course._id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full"
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
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full"
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
