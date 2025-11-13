import React from "react";
import { Edit3, Trash2, Eye } from "lucide-react";

const MyCourses = () => {
  const courses = [
    { title: "React for Beginners", students: 120, status: "Published" },
    { title: "Mastering TailwindCSS", students: 80, status: "Draft" },
    { title: "Fullstack with Node.js", students: 150, status: "Published" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="py-3 px-4">Course Title</th>
              <th className="py-3 px-4">Students</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{course.title}</td>
                <td className="py-3 px-4">{course.students}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      course.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-5 h-5 inline" />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800">
                    <Edit3 className="w-5 h-5 inline" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyCourses;
