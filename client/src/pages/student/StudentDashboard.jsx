// src/pages/student/StudentDashboard.jsx
import { useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const StudentDashboard = () => {
  const { user } = useAuth();

  // inject Google font link once (Poppins)
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

  // ensure the page background is full-bleed blue-50 (#eff6ff).
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#eff6ff"; // tailwind blue-50
    return () => {
      document.body.style.backgroundColor = prev ?? "";
    };
  }, []);

  const firstName = useMemo(() => {
    return user?.name?.split?.(" ")?.[0] || "Learner";
  }, [user]);

  const coursesCount = 5;
  const xp = 2450;
  const certificatesCount = 2;
  const badges = [
    { id: 1, title: "Quick Learner", color: "bg-yellow-400", icon: "⚡" },
    { id: 2, title: "Consistency Champ", color: "bg-green-500", icon: "🔥" },
    { id: 3, title: "Full Stack Hero", color: "bg-purple-500", icon: "💻" },
  ];

  const currentCourses = [
    {
      id: 1,
      title: "React for Beginners",
      progress: 60,
      instructor: "John Doe",
      image:
        "https://images.unsplash.com/photo-1584697964383-8a21e4b6e5aa?auto=format&fit=crop&w=1200&q=60",
    },
    {
      id: 2,
      title: "Mastering Node.js",
      progress: 35,
      instructor: "Jane Smith",
      image:
        "https://images.unsplash.com/photo-1590608897129-79da98d159f2?auto=format&fit=crop&w=1200&q=60",
    },
    {
      id: 3,
      title: "UI/UX Design Essentials",
      progress: 85,
      instructor: "Sarah Johnson",
      image:
        "https://images.unsplash.com/photo-1581276879432-15a19d654956?auto=format&fit=crop&w=1200&q=60",
    },
  ];

  // inline style to ensure Poppins is used immediately
  const rootFontStyle = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  return (
    <div className="min-h-screen w-full" style={rootFontStyle}>
      {/* <Navbar /> */}

      <div className="w-full">
        {/* --- HERO (container moved slightly left on lg screens) --- */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 lg:-ml-3 mb-6">
          <div className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 text-white shadow-md overflow-hidden rounded-3xl">
            <div className="rounded-3xl overflow-hidden lg:pl-0">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative z-10 p-6 sm:p-8 flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight drop-shadow-md">
                    Welcome back, {firstName}!
                  </h1>
                  <p className="text-white/95 max-w-2xl text-sm sm:text-base leading-relaxed mx-auto sm:mx-0">
                    Great to see you again! Continue your journey — complete lessons,
                    earn XP, and progress toward your next certificates and badges.
                  </p>
                </div>

                <div className="hidden md:block pr-6 flex-shrink-0">
                  <svg
                    width="300"
                    height="200"
                    viewBox="0 0 320 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rounded-2xl drop-shadow-2xl opacity-100"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="grad1" x1="0" x2="1">
                        <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
                        <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="320" height="220" rx="20" fill="url(#grad1)" />
                    <circle cx="110" cy="90" r="46" fill="rgba(255,255,255,0.2)" />
                    <rect
                      x="150"
                      y="40"
                      width="140"
                      height="120"
                      rx="18"
                      fill="rgba(255,255,255,0.12)"
                    />
                    <g transform="translate(20,150)">
                      <rect x="0" y="0" width="90" height="14" rx="7" fill="rgba(255,255,255,0.3)" />
                      <rect
                        x="100"
                        y="0"
                        width="120"
                        height="14"
                        rx="7"
                        fill="rgba(255,255,255,0.18)"
                      />
                    </g>
                    <path
                      d="M180 140c18-10 60-25 110-15"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SUMMARY CARDS (same left shift so edges align) --- */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 lg:-ml-3 mb-6">
          <div className="lg:pl-0">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
                <h3 className="text-sm text-gray-500 mb-2">Courses Enrolled</h3>
                <p className="text-2xl sm:text-3xl font-bold text-sky-600">{coursesCount}</p>
                <p className="text-xs text-gray-400 mt-1 sm:mt-2">Keep up the good work!</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
                <h3 className="text-sm text-gray-500 mb-2">XP Earned</h3>
                <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{xp.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1 sm:mt-2">Gain more XP by finishing lessons</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
                <h3 className="text-sm text-gray-500 mb-2">Certificates</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{certificatesCount}</p>
                <p className="text-xs text-gray-400 mt-1 sm:mt-2">Show your accomplishments</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border border-blue-100 hover:shadow-lg transition">
                <h3 className="text-sm text-gray-500 mb-2">Badges Earned</h3>
                <p className="text-2xl sm:text-3xl font-bold text-sky-600">{badges.length}</p>
                <p className="text-xs text-gray-400 mt-1 sm:mt-2">Milestones unlocked</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CURRENT COURSES (mobile list + desktop horizontal scroller) --- */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 lg:-ml-3 mb-12">
          <div className="lg:pl-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Current Courses</h2>
              <div className="hidden sm:block text-sm text-sky-600 hover:underline cursor-pointer">
                All Courses →
              </div>
            </div>

            {/* ===== Mobile: vertical list (default / mobile-first) ===== */}
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

            {/* ===== Desktop / Tablet: horizontal scroller (unchanged) ===== */}
            <div
              className="hidden md:flex gap-4 overflow-x-auto py-2 pb-4 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow border border-blue-100 overflow-hidden hover:shadow-lg transition flex-shrink-0 snap-center"
                  style={{ minWidth: "20.5rem" }} // consistent card width on larger screens
                >
                  <div className="h-28 sm:h-32 w-full overflow-hidden rounded-t-2xl">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col" style={{ minHeight: "8.5rem" }}>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold mb-1 text-gray-800">
                        {course.title}
                      </h3>
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

            <div className="mt-3 flex justify-center sm:hidden">
              {/* on small screens show an action below if needed */}
              <button className="bg-sky-500 text-white px-5 py-2 rounded-full hover:bg-sky-600 transition text-sm">
                View all courses
              </button>
            </div>

            <div className="hidden sm:flex mt-6 justify-center">
              <button className="bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600 transition">
                View all courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
