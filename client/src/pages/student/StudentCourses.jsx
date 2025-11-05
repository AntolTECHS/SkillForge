import { useState } from "react";

const StudentCourses = () => {
  const [courses] = useState([
    { id: 1, title: "React Mastery", progress: 80 },
    { id: 2, title: "Node.js Bootcamp", progress: 60 },
    { id: 3, title: "MongoDB Essentials", progress: 45 },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📚 Your Courses</h1>
      <p className="text-gray-600 mb-6">
        Track your enrolled courses and continue where you left off.
      </p>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white p-6 rounded-2xl shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 mt-2 text-sm">
              Progress: {course.progress}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
