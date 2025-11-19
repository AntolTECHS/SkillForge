import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    coursesCount: 0,
    xp: 0,
    certificatesCount: 0,
    badges: [],
  });
  const [currentCourses, setCurrentCourses] = useState([]);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  const placeholderImage = "/images/course-placeholder.png";

  // --------------------------
  // Google Font Injection
  // --------------------------
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

  // --------------------------
  // Background override
  // --------------------------
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#eff6ff";
    return () => {
      document.body.style.backgroundColor = previous ?? "";
    };
  }, []);

  // --------------------------
  // First Name
  // --------------------------
  const firstName = useMemo(() => user?.name?.split?.(" ")?.[0] || "Learner", [user]);

  // --------------------------
  // Fetch dashboard stats + enrolled courses
  // --------------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const [dashboardRes, enrollRes] = await Promise.all([
          axios.get("/api/student/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/enrollments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Dashboard stats
        const dashboardData = dashboardRes.data ?? {};
        setStats(dashboardData.stats ?? {});

        // Enrolled courses
        const enrolledCourses = (enrollRes.data.enrollments || []).map((e) => ({
          ...e.course,
          progress: e.progress || 0,
          hasPaid: e.hasPaid,
        }));
        setCurrentCourses(enrolledCourses);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="min-h-screen w-full p-4 sm:p-6" style={rootFontStyle}>
      {/* HERO */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 text-white shadow-md overflow-hidden rounded-3xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-white/95 max-w-2xl text-sm sm:text-base leading-relaxed">
            Continue your learning journey — complete lessons, earn XP, and unlock certificates & badges.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 text-red-600 font-medium">{error}</div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="max-w-7xl mx-auto mb-6 text-gray-500">Loading dashboard...</div>
      )}

      {/* STATS */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto mb-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 mb-2">Courses Enrolled</h3>
            <p className="text-2xl sm:text-3xl font-bold text-sky-600">{stats.coursesCount ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2">Keep up the good work!</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 mb-2">XP Earned</h3>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-600">
              {stats.xp?.toLocaleString() ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2">Gain more XP by finishing lessons</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 mb-2">Certificates</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.certificatesCount ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2">Show your accomplishments</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
            <h3 className="text-sm text-gray-500 mb-2">Badges Earned</h3>
            <p className="text-2xl sm:text-3xl font-bold text-sky-600">{stats.badges?.length ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2">Milestones unlocked</p>
          </div>
        </div>
      )}

      {/* CURRENT COURSES */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Current Courses</h2>
          </div>

          {currentCourses.length === 0 ? (
            <p className="text-gray-500 italic">You are not enrolled in any courses yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow border border-blue-100 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-28 sm:h-32 w-full overflow-hidden rounded-t-2xl">
                    <img
                      src={course.image || placeholderImage}
                      alt={course.title || "Course Image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col" style={{ minHeight: "8.5rem" }}>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold mb-1 text-gray-800">{course.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">Instructor: {course.instructor ?? "TBA"}</p>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                        <div
                          className="bg-sky-500 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress ?? 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{course.progress ?? 0}% completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
