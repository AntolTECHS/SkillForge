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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Section */}
          <div className="text-left space-y-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-10 h-10 text-blue-200" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Explore Our Programs
              </h1>
            </div>

            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-xl">
              Empower your learning journey with focused programs crafted to help you
              grow, upskill, and thrive in your professional path.
            </p>
          </div>

          {/* Right Section: Banner Image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="https://img.freepik.com/free-vector/online-learning-platform-abstract-concept-illustration_335657-3875.jpg"
              alt="Learning banner"
              className="w-full max-w-lg h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Learning Categories Section */}
      <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 py-5">
        <div className="text-left space-y-3">
          <p className="text-gray-900 text-base font-semibold">Get Started</p>

          <div className="flex flex-wrap gap-3">
            {["Beginner Friendly", "Popular", "New"].map((title) => (
              <button
                key={title}
                className="px-5 py-2 bg-white border border-gray-300 text-sm text-gray-700 rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-700 transition font-medium"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 pb-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <p className="text-gray-600 text-center">No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="cursor-pointer"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
