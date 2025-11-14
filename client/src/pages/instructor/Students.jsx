import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import axios from "axios";

const Students = () => {
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [loading, setLoading] = useState(true);

  const pageFont = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/instructor/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          // Group students by course
          const grouped = {};
          res.data.students.forEach((student) => {
            if (!grouped[student.course]) grouped[student.course] = [];
            grouped[student.course].push(student);
          });
          setStudentsByCourse(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
        alert("Failed to fetch students. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-xl font-semibold" style={pageFont}>
        Loading students...
      </div>
    );

  return (
    <div className="p-6" style={pageFont}>
      <h1 className="text-3xl font-bold mb-6">My Students</h1>

      {Object.keys(studentsByCourse).length === 0 ? (
        <p className="text-gray-600">No students enrolled yet.</p>
      ) : (
        Object.entries(studentsByCourse).map(([courseTitle, students]) => (
          <div key={courseTitle} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{courseTitle}</h2>

            {/* Responsive wrapper for horizontal scrolling on small screens */}
            <div className="bg-white shadow rounded-xl overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="w-full border-collapse text-gray-700" style={pageFont}>
                  <thead className="bg-gray-100 text-left text-gray-600">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{student.name}</span>
                        </td>
                        <td className="py-3 px-4">{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ))
      )}
    </div>
  );
};

export default Students;
