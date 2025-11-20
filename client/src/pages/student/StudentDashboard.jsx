import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ coursesCount: 0, xp: 0, badges: [] });
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  const placeholderImage = "/images/course-placeholder.png";

  const firstName = useMemo(
    () => user?.name?.split?.(" ")?.[0] || "Learner",
    [user]
  );

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

  // Body background color
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#eff6ff";
    return () => {
      document.body.style.backgroundColor = prev ?? "";
    };
  }, []);

  // Fetch dashboard data only if user is logged in
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [coursesRes, enrollRes, statsRes] = await Promise.all([
          axiosInstance.get("/courses/available"),
          axiosInstance.get("/enrollments"),
          axiosInstance.get("/student/dashboard"),
        ]);

        // Stats
        setStats({
          xp: statsRes.data.stats?.xp || 0,
          badges: statsRes.data.stats?.badges || [],
          coursesCount: (enrollRes.data.enrollments || []).length,
        });

        // Enrolled courses mapping
        const enrolledSet = new Set();
        const enrolledMap = {};
        (enrollRes.data.enrollments || []).forEach((e) => {
          enrolledSet.add(e.course._id);
          enrolledMap[e.course._id] = { progress: e.progress || 0, hasPaid: e.hasPaid };
        });
        setEnrolledIds(enrolledSet);

        // Merge course data with enrollment info
        const allCourses = (coursesRes.data.courses || []).map((c) => ({
          ...c,
          progress: enrolledMap[c._id]?.progress || 0,
          hasPaid: enrolledMap[c._id]?.hasPaid || false,
        }));
        setCourses(allCourses);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const cacheBust = (url) => (url ? `${url}?v=${new Date().getTime()}` : "");
  const displayedCourses = showAll ? courses : courses.slice(0, 3);

  return (
    <div className="w-full min-h-screen" style={rootFontStyle}>
      {/* ================= HERO / Welcome rectangle ================= */}
      {!user ? (
        // Center rectangle for guests
        <div className="flex items-center justify-center min-h-screen px-4">
          <div
            className="
              bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400
              text-white shadow-md overflow-hidden rounded-3xl
              p-8 sm:p-10 lg:p-12
              text-center
              max-w-xl w-full
            "
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Welcome to SkillForge!
            </h1>
            <p className="text-white/90 max-w-xl mb-6 text-lg sm:text-xl">
              Start your learning journey today — explore courses, earn XP, and
              unlock badges as you master new skills.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        // Top rectangle for logged-in students
        <div className="mb-6">
          <div
            className="
              bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400
              text-white shadow-md overflow-hidden rounded-3xl
              p-8 sm:p-10 lg:p-12
              min-h-[180px] sm:min-h-[220px]
              flex flex-col justify-center items-center text-center
            "
          >
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-3">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/95 max-w-full text-sm sm:text-base leading-relaxed">
              Continue your learning journey — complete lessons, earn XP, track your
              progress, and unlock badges as you master new skills.
            </p>
          </div>
        </div>
      )}

      {/* ================= ERROR / LOADING ================= */}
      {error && <div className="mb-6 text-red-600 font-medium text-center">{error}</div>}
      {loading && user && <div className="mb-6 text-gray-500 text-center">Loading dashboard...</div>}

      {/* ================= STATS & COURSES ================= */}
      {user && !loading && !error && (
        <div className="px-4">
          {/* STATS */}
          <div className="mb-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
              <h3 className="text-sm text-gray-500 mb-2">Courses Enrolled</h3>
              <p className="text-2xl sm:text-3xl font-bold text-sky-600">{stats.coursesCount}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">Keep up the good work!</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
              <h3 className="text-sm text-gray-500 mb-2">XP Earned</h3>
              <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{stats.xp?.toLocaleString() ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">Gain more XP by finishing lessons</p>
            </div>

            <div
              className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition col-span-2 sm:col-span-2 md:col-span-1 text-center md:text-left"
            >
              <h3 className="text-sm text-gray-500 mb-2">Badges Earned</h3>
              <p className="text-2xl sm:text-3xl font-bold text-sky-600">{stats.badges?.length ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">Milestones unlocked</p>
            </div>
          </div>

          {/* CURRENT COURSES */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Current Courses</h2>

            {courses.length === 0 ? (
              <p className="text-gray-500 italic">No courses available at the moment.</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayedCourses.map((course) => (
                    <div
                      key={course._id}
                      className="bg-white rounded-2xl shadow border border-blue-100 overflow-hidden hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="h-28 sm:h-32 w-full overflow-hidden rounded-t-2xl bg-gray-100">
                        <img
                          src={cacheBust(course.image) || placeholderImage}
                          alt={course.title || "Course Image"}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="p-4 flex flex-col" style={{ minHeight: "8rem" }}>
                        <h3 className="text-sm sm:text-base font-semibold mb-1 text-gray-800">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Instructor: {course.instructor?.name || "TBA"}
                        </p>

                        <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                          <div
                            className="bg-sky-500 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>

                        <p className="text-xs text-gray-500">{course.progress}% completed</p>
                      </div>
                    </div>
                  ))}
                </div>

                {courses.length > 3 && !showAll && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowAll(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition"
                    >
                      View All Courses
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
