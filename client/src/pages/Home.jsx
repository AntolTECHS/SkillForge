import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import HeroSection from "../components/HeroSection"; // ✅ new import

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/courses");
      setCourses(response.data.courses || []);
      setTotal(
        response.data.total ||
          (response.data.courses ? response.data.courses.length : 0)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    if (user && user._id) {
      navigate(`/course/${course._id}`);
    } else {
      navigate("/register", { state: { redirectTo: `/course/${course._id}` } });
    }
  };

  const displaySlots = 3;
  const displayCourses = courses.slice(0, displaySlots);
  const placeholders = Array.from({
    length: Math.max(0, displaySlots - displayCourses.length),
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Reusable Hero Section */}
      <HeroSection />

      {/* Why Choose Section */}
      <div className="bg-white shadow-md rounded-lg py-16 mb-12">
        <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Why Choose SkillForge?
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-12">
            We empower learners through engaging micro-courses, peer
            collaboration, and real-world mentorship designed to accelerate your
            growth.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Learn Faster
              </h3>
              <p className="text-gray-700">
                Access practical, bite-sized courses designed for immediate
                application in your career.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Peer Collaboration
              </h3>
              <p className="text-gray-700">
                Grow alongside like-minded learners, share ideas, and learn from
                one another.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Real-World Skills
              </h3>
              <p className="text-gray-700">
                Gain relevant, actionable skills that empower you to thrive in
                your profession.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Programs
          </h2>
          <p className="text-gray-600">{total} available</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayCourses.map((course) => (
            <div
              key={course._id}
              onClick={() => handleCourseClick(course)}
              className="cursor-pointer flex justify-center"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCourseClick(course);
              }}
            >
              <div className="w-full max-w-xs lg:max-w-sm">
                <CourseCard course={course} />
              </div>
            </div>
          ))}

          {placeholders.map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              onClick={() => navigate("/register")}
              className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition w-full max-w-xs lg:max-w-sm mx-auto"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate("/register");
              }}
            >
              <div className="text-3xl text-gray-400 mb-3">🎓</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Join SkillForge
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Sign up to unlock all programs and start learning today.
              </p>
              <button
                className="mt-4 inline-flex items-center rounded bg-blue-950 text-white px-4 py-2 text-sm font-medium hover:bg-blue-900 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/register");
                }}
              >
                Sign Up
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
