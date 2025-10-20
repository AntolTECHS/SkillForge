// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { AlertCircle, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleCourseClick = (course) => {
    if (user && user._id) {
      navigate(`/course/${course._id}`);
    } else {
      navigate("/register", { state: { redirectTo: `/course/${course._id}` } });
    }
  };

  // ✅ Display only 3 course cards
  const displaySlots = 3;
  const displayCourses = courses.slice(0, displaySlots);
  const placeholderCount = Math.max(0, displaySlots - displayCourses.length);
  const placeholders = Array.from({ length: placeholderCount });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Side Image */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left space-y-6">
            <div className="flex justify-center lg:justify-start items-center mb-4">
              <BookOpen className="w-12 h-12 mr-3 text-blue-200" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Welcome to SkillForge
              </h1>
            </div>

            <p className="text-xl text-blue-100 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Unlock your potential with expert-led courses. Learn new skills
              and advance your career through hands-on learning experiences.
            </p>

            <div className="pt-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center rounded-md bg-white text-blue-950 px-6 py-3 font-semibold shadow hover:bg-blue-50 transition"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80"
              alt="Learning Illustration"
              className="w-full max-w-lg rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </div>

      {/* Unique Section: Why Choose SkillForge */}
      <div className="bg-white shadow-md rounded-lg py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Why Choose SkillForge?
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-12">
            We empower learners with practical skills, expert instructors, and a
            community-driven experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Fast Learning
              </h3>
              <p className="text-gray-700">
                Get up to speed with practical, bite-sized courses designed for
                immediate impact.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105">
              <div className="text-4xl mb-4">👩‍🏫</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Expert Instructors
              </h3>
              <p className="text-gray-700">
                Learn from industry leaders with real-world experience and
                guidance at every step.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Career Growth
              </h3>
              <p className="text-gray-700">
                Acquire skills that boost your career, with certificates to
                showcase your achievements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
          <p className="text-gray-600">{total} courses available</p>
        </div>

        {/* Course Grid */}
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

          {/* Placeholder Cards */}
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
                Become a member
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Sign up to access more courses and enroll instantly.
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
