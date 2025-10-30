import React, { useEffect, useState } from "react";
import { getInstructorCourses, syncCourseraCourses } from "../../api/courseApi";
import { useAuth } from "../../context/AuthContext";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const data = await getInstructorCourses();
      setCourses(data);
    } catch (err) {
      console.error("❌ Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const res = await syncCourseraCourses();
      alert(res.message);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Sync failed");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        👩‍🏫 {user?.name || "Instructor"}'s Dashboard
      </h1>

      <div className="flex justify-between mb-6">
        <button
          onClick={handleSync}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Sync Coursera Courses
        </button>
        <button
          onClick={() => alert("Course creation modal here")}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          + New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-2">
                {course.description?.slice(0, 80) || "No description"}...
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Category: {course.category}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Price: ${course.price}
                </span>
                <button
                  onClick={() => alert(`Edit ${course._id}`)}
                  className="text-indigo-600 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
