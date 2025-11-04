import { useEffect, useState } from "react";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";
import { AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Fetch all available courses
        const availableRes = await axios.get("/student/courses");
        const available = Array.isArray(availableRes.data)
          ? availableRes.data
          : availableRes.data.courses || [];

        // ✅ Fetch enrolled courses
        const enrolledRes = await axios.get("/student/my-courses");
        const enrolled = Array.isArray(enrolledRes.data)
          ? enrolledRes.data
          : enrolledRes.data.courses || [];

        setAvailableCourses(available);
        setEnrolledCourses(enrolled);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <div>
            <h3 className="font-semibold mb-1">Error Loading Dashboard</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Enrolled Courses */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
          {enrolledCourses.length === 0 ? (
            <p className="text-gray-600">You haven’t enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* All Available Courses */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
          {availableCourses.length === 0 ? (
            <p className="text-gray-600">No available courses found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
