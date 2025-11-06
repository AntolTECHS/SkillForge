import { useState, useEffect } from "react";
import axios from "axios";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Google Font (once)
  useEffect(() => {
    const id = "gf-poppins";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/student/enrollments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(data.enrollments || []);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-gray-500" style={rootFontStyle}>
        Loading your courses...
      </div>
    );

  return (
    <div className="p-6" style={rootFontStyle}>
      <h1 className="text-3xl font-bold mb-4">📚 Your Courses</h1>
      <p className="text-gray-600 mb-6">
        Track your enrolled courses and continue where you left off.
      </p>

      {courses.length === 0 ? (
        <div className="text-gray-500 italic">You’re not enrolled in any courses yet.</div>
      ) : (
        <div className="space-y-4">
          {courses.map((enrollment) => {
            const course = enrollment.course;
            const trialRemaining = Math.ceil(
              (new Date(enrollment.trialExpiresAt) - new Date()) /
                (1000 * 60 * 60 * 24)
            );
            const trialExpired = trialRemaining <= 0 && !enrollment.hasPaid;

            return (
              <div
                key={course._id}
                className={`p-6 rounded-2xl border ${
                  trialExpired
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-gray-200 shadow"
                }`}
              >
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      trialExpired ? "bg-gray-400" : "bg-blue-600"
                    }`}
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>

                {/* Trial status */}
                <p className="text-sm mt-2 text-gray-600">
                  {enrollment.hasPaid
                    ? "✅ Full Access"
                    : trialExpired
                    ? "⛔ Trial expired — please upgrade"
                    : `🕒 Trial: ${trialRemaining} days left`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
