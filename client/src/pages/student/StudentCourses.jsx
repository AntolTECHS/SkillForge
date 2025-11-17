import { useState, useEffect } from "react";
import axios from "axios";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  // Load Google Fonts
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

  // Fetch courses & enrolled courses
  const fetchCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [coursesRes, enrollRes] = await Promise.all([
        axios.get("http://localhost:5000/api/courses/available"),
        token
          ? axios.get("http://localhost:5000/api/student/my-courses", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: { enrollments: [] } }),
      ]);

      const allCourses = Array.isArray(coursesRes.data.courses)
        ? coursesRes.data.courses
        : [];

      const enrolledCourses = (enrollRes.data.enrollments || []).map((e) => ({
        ...e.course,
        progress: e.progress || 0,
        hasPaid: e.hasPaid,
        started: e.started,
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
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to enroll in a course.");

    setEnrollingCourseId(courseId);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/student/enroll/${courseId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Enrolled successfully!");
      await fetchCoursesAndEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
      console.error(err);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Start a course
  const handleStartCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `http://localhost:5000/api/student/open/${course._id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to open course:", err);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
  };

  // Update course progress
  const updateCourseProgress = async (courseId, newProgress) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.put(
        `http://localhost:5000/api/student/progress/${courseId}`,
        { progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEnrolled((prev) =>
        prev.map((c) =>
          c._id === courseId ? { ...c, progress: res.data.progress } : c
        )
      );

      if (res.data.xpGained) console.log(`You gained ${res.data.xpGained} XP!`);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  // Handle lesson viewed
  useEffect(() => {
    if (!selectedCourse || !selectedLesson) return;

    const totalLessons = selectedCourse.content?.length || 1;
    const lessonIndex = selectedCourse.content.findIndex(
      (l) => l._id === selectedLesson._id
    );

    const newProgress = Math.min(
      100,
      Math.round(((lessonIndex + 1) / totalLessons) * 100)
    );

    updateCourseProgress(selectedCourse._id, newProgress);
  }, [selectedLesson]);

  // === LESSON VIEW ===
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

        <h2 className="text-xl font-semibold mb-4">Course Lessons</h2>
        {selectedCourse.content?.length ? (
          <div className="space-y-3">
            {selectedCourse.content.map((lesson) => (
              <div
                key={lesson._id || lesson.title}
                onClick={() => setSelectedLesson(lesson)}
                className="p-4 bg-gray-50 rounded-xl border cursor-pointer hover:bg-gray-100 transition"
              >
                <h3 className="font-semibold text-gray-800 line-clamp-1">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-500">{lesson.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No lessons available yet.</p>
        )}
      </div>
    );
  }

  // === MAIN PAGE ===
  const enrolledIds = new Set(enrolled.map((c) => c._id));
  const recommended = courses.filter((c) => !enrolledIds.has(c._id));

  if (loading) return <p className="p-6">Loading courses...</p>;

  const getImageUrl = (img) => {
    // If image starts with http/https, return as-is, else prepend backend URL
    if (!img) return "/images/default-course.png";
    return img.startsWith("http") ? img : `http://localhost:5000/${img}`;
  };

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
                key={course._id || course.title}
                onClick={() => handleStartCourse(course)}
                className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg transition cursor-pointer flex gap-4 items-center"
              >
                <img
                  src={getImageUrl(course.image)}
                  alt={course.title}
                  className="w-24 h-24 object-cover rounded-xl shadow flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 transition-all duration-300"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-600">
                    {course.progress || 0}% Completed
                  </p>
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
                key={course._id || course.title}
                className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg transition flex gap-4 items-center"
              >
                <img
                  src={getImageUrl(course.image)}
                  alt={course.title}
                  className="w-24 h-24 object-cover rounded-xl shadow flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {course.description?.slice(0, 90) || "Learn more about this course."}
                  </p>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrollingCourseId === course._id}
                    className={`text-xs px-4 py-2 rounded-lg text-white ${
                      enrollingCourseId === course._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {enrollingCourseId === course._id ? "Enrolling..." : "Enroll Now"}
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
