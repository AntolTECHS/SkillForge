import { useEffect, useState } from "react";
import { BookOpen, PlusCircle, UploadCloud, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import InstructorSidebar from "./instructorSidebar";


const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("/api/instructor/my-courses", { withCredentials: true });
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handlePublish = async (courseId) => {
    try {
      await axios.post(`/api/instructor/courses/${courseId}/publish`, {}, { withCredentials: true });
      setCourses(prev => prev.map(c => (c._id === courseId ? { ...c, isPublished: true } : c)));
    } catch (err) {
      console.error("Error publishing course:", err);
      alert("Failed to publish course");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <InstructorSidebar />

      {/* Main Content */}
      <main className="flex-1 pt-20 px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your courses, modules, and lessons.</p>
          </div>

          <Link
            to="/instructor/create-course"
            className="mt-4 sm:mt-0 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Course
          </Link>
        </div>

        {/* Courses Section */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading your courses...</div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h2>
            <p className="text-gray-500 mb-4">
              Start by creating your first course and begin teaching!
            </p>
            <Link
              to="/instructor/create-course"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow hover:shadow-2xl border border-gray-100 transition-transform transform hover:-translate-y-1 duration-300"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={course.thumbnail || "https://via.placeholder.com/400x200.png?text=Course+Thumbnail"}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-2xl"
                  />
                  <div className="absolute top-3 right-3">
                    {course.isPublished ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Published
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description || "No description provided."}</p>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Modules: {course.modules?.length || 0}</span>
                    <span>Quizzes: {course.quizzes?.length || 0}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      to={`/instructor/course/${course._id}/edit`}
                      className="text-blue-600 font-semibold hover:underline text-sm"
                    >
                      Edit Course
                    </Link>

                    {!course.isPublished && (
                      <button
                        onClick={() => handlePublish(course._id)}
                        className="flex items-center text-sm text-gray-600 hover:text-green-600 transition"
                      >
                        <UploadCloud className="w-4 h-4 mr-1" />
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorDashboard;
