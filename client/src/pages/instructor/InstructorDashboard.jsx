import React, { useEffect, useState } from "react";
import { BookOpen, Users, Clock } from "lucide-react";
import axios from "axios";

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    pendingReviews: 0,
  });
  const [activeCourses, setActiveCourses] = useState([]);

  const pageFont = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const coursesRes = await axios.get(
          "http://localhost:5000/api/instructor/my-courses",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const courses = coursesRes.data.courses || [];

        const totalStudents = courses.reduce(
          (acc, c) => acc + (c.studentsCount || 0),
          0
        );

        const pendingReviews = courses.filter((c) => !c.isPublished).length;

        setStats({
          courses: courses.length,
          students: totalStudents,
          pendingReviews,
        });

        setActiveCourses(courses);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      icon: BookOpen,
      label: "Courses",
      value: stats.courses,
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: Users,
      label: "Students",
      value: stats.students,
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Clock,
      label: "Pending Reviews",
      value: stats.pendingReviews,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="p-6" style={pageFont}>
      <h1 className="text-3xl font-bold mb-8">Instructor Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map(({ icon: Icon, label, value, color }, idx) => (
          <div
            key={label}
            className={`bg-white shadow-lg rounded-2xl p-6 flex items-center justify-between hover:shadow-xl transition-shadow ${
              idx === 2 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <h2 className="text-2xl font-bold mt-1">{value}</h2>
            </div>

            {/* Icon Wrapper — improved sizing */}
            <div
              className={`p-3 sm:p-4 rounded-full ${color} flex items-center justify-center`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Active Courses */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold mb-5">Your Active Courses</h2>
        {activeCourses.length === 0 ? (
          <p className="text-gray-600">No courses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <table className="w-full border-collapse text-gray-700">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCourses.map((course) => (
                    <tr
                      key={course._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{course.title}</td>
                      <td className="py-3 px-4">{course.studentsCount || 0}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            course.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5">Recent Activity</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            <ul className="space-y-3 text-gray-700">
              {activeCourses.slice(-3).map((course, idx) => (
                <li key={idx}>
                  {course.isPublished ? "✅ Published" : "✏️ Updated"}{" "}
                  <b>{course.title}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
