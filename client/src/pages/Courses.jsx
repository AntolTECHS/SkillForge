import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { AlertCircle, BookOpen } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("get-started");
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

  const getFilteredCourses = () => {
    switch (activeTab) {
      case "beginner":
        return courses.slice(0, 4);
      case "popular":
        return courses.slice(4, 8);
      case "new":
        return courses.slice(8, 12);
      default:
        return courses.slice(0, 8);
    }
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 to-blue-900 text-white overflow-hidden">
        <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 py-14 flex flex-col lg:flex-row items-center lg:items-start gap-10">
          {/* Left Text */}
          <div className="lg:w-1/2 text-left space-y-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-9 h-9 text-blue-200" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Explore Our Programs
              </h1>
            </div>

            <p className="text-lg text-blue-100 leading-relaxed max-w-md">
              Empower your learning journey with practical, hands-on programs
              designed for African learners and global professionals alike.
            </p>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <img
              src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80"
              alt="African students learning together"
              className="w-full max-w-lg h-56 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="py-16 px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 bg-gray-50">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Tabs aligned left */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-3 justify-start">
            {[
              { key: "get-started", label: "Get Started" },
              { key: "beginner", label: "Beginner" },
              { key: "popular", label: "Popular" },
              { key: "new", label: "New" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-blue-950 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/course/${course._id}`)}
              className="cursor-pointer"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Load More */}
        {courses.length > filteredCourses.length && (
          <div className="text-left mt-12">
            <button
              onClick={() => setActiveTab("get-started")}
              className="px-6 py-3 bg-blue-950 text-white rounded-md font-semibold hover:bg-blue-900 transition"
            >
              Show More Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
