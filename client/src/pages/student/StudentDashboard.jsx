// src/pages/student/StudentDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const StudentDashboard = () => {
  const { user } = useAuth();

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
  const firstName = useMemo(() => {
    return user?.name?.split?.(" ")?.[0] || "Learner";
  }, [user]);

  // --------------------------
  // Dashboard Data (Dynamic)
  // --------------------------
  const [stats, setStats] = useState({
    coursesCount: 0,
    xp: 0,
    certificatesCount: 0,
    badges: [],
  });
  const [currentCourses, setCurrentCourses] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await axios.get("/api/student/dashboard");
        setStats(res.data.stats ?? {});
        setCurrentCourses(res.data.currentCourses ?? []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    loadDashboard();
  }, []);

  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  return (
    <div className="min-h-screen w-full" style={rootFontStyle}>
      {/* <Navbar /> */}

      <div className="w-full">
        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 lg:-ml-3 mb-6">
          <div className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 text-white shadow-md overflow-hidden rounded-3xl">
            <div className="rounded-3xl overflow-hidden lg:pl-0">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative z-10 p-6 sm:p-8 flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight drop-shadow-md">
                    Welcome back, {firstName}!
                  </h1>
                  <p className="text-white/95 max-w-2xl text-sm sm:text-base leading-relaxed mx-auto sm:mx-0">
                    Continue your journey — complete lessons, earn XP, and progress toward your next certificates and badges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 lg:-ml-3 mb-6">
          <div className="lg:pl-0">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
                <h3 className="text-sm text-gray-500 mb-2">Courses Enrolled</h3>
                <p className="text-2xl sm:text-3xl font-bold text-sky-600">
                  {stats.coursesCount ?? 0}
                </p>
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
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {stats.certificatesCount ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1 sm:mt-2">Show your accomplishments</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
                <h3 className="text-sm text-gray-500 mb-2">Badges Earned</h3>
                <p className="text-2xl sm:text-3xl font-bold text-sky-600">
                  {stats.badges?.length ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1 sm:mt-2">Milestones unlocked</p>
              </div>
            </div>
          </div>
        </div>

        {/* CURRENT COURSES */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 lg:-ml-3 mb-12">
          <div className="lg:pl-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Current Courses</h2>
              <div className="hidden sm:block text-sm text-sky-600 hover:underline cursor-pointer">
                All Courses →
              </div>
            </div>

            {/* MOBILE LIST */}
            <div className="flex flex-col gap-3 md:hidden">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow border border-blue-100 overflow-hidden transition p-3 flex items-center gap-3"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">{course.title}</h3>
                      <div className="text-sm font-semibold text-sky-600">{course.progress}%</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Instructor: {course.instructor}</p>
                    <div className="mt-3">
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-sky-500 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP HORIZONTAL SCROLLER */}
            <div className="hidden md:flex gap-4 overflow-x-auto py-2 pb-4 snap-x snap-mandatory">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow border border-blue-100 overflow-hidden hover:shadow-lg transition flex-shrink-0 snap-center"
                  style={{ minWidth: "20.5rem" }}
                >
                  <div className="h-28 sm:h-32 w-full overflow-hidden rounded-t-2xl">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col" style={{ minHeight: "8.5rem" }}>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold mb-1 text-gray-800">{course.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">Instructor: {course.instructor}</p>
                    </div>

                    <div className="mt-1">
                      <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                        <div
                          className="bg-sky-500 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{course.progress}% completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
