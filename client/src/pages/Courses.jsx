import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { AlertCircle } from "lucide-react";
import HeroSection from "../components/HeroSection"; // ✅ Reuse Hero Section

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/courses");
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Reuse Hero Section below Navbar */}
      <HeroSection />

      <div className="py-16 px-6 sm:px-10 md:px-20 lg:px-32 xl:px-48">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Explore Programs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from a wide range of courses designed to boost your skills and
            career opportunities.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Get Started with SkillForge
            </h2>
            <button className="text-blue-700 hover:underline text-sm font-medium">
              Show more
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.slice(0, 4).map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="cursor-pointer"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Add to Your Skill Set
            </h2>
            <button className="text-blue-700 hover:underline text-sm font-medium">
              Show more
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.slice(4, 8).map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="cursor-pointer"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
