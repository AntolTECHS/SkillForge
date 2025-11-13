import React from "react";
import { User } from "lucide-react";

const Students = () => {
  const students = [
    { name: "John Doe", course: "React for Beginners", progress: 85 },
    { name: "Jane Smith", course: "Node.js Mastery", progress: 65 },
    { name: "Alex Johnson", course: "Fullstack Bootcamp", progress: 45 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Students</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{student.name}</span>
                </td>
                <td className="py-3 px-4">{student.course}</td>
                <td className="py-3 px-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{student.progress}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
