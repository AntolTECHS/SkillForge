import React, { useEffect, useState } from "react";
import { Edit3, Trash2, Eye, User, ArrowUpDown } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const coursesPerPage = 5;
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "https://skillforge-75b5.onrender.com";

  const pageFont = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  const fetchCourses = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to view courses.");

      const res = await axios.get(
        `${API_URL}/api/instructor/my-courses?page=${page}&limit=${coursesPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourses(res.data.courses || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch courses", err?.response?.data || err.message);
      if (err.response?.status === 403) {
        alert("Access denied. Must be an instructor.");
      } else {
        alert(`Failed to load courses: ${err?.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedCourses = [...courses].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (sortConfig.key === "title") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (sortConfig.direction === "ascending") {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });

  const handleView = (id) => navigate(`/courses/${id}`);
  const handleEdit = (id) => navigate(`/instructor/course/edit/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/instructor/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses(currentPage); // Refresh after deletion
    } catch (err) {
      console.error("Failed to delete course", err?.response?.data || err.message);
      alert(`Failed to delete course: ${err?.response?.data?.message || err.message}`);
    }
  };

  if (loading)
    return (
      <div style={pageFont} className="p-6 text-center text-gray-500">
        Loading courses...
      </div>
    );

  if (courses.length === 0)
    return (
      <div style={pageFont} className="p-6 text-center text-gray-500">
        No courses found. Create one to get started!
      </div>
    );

  return (
    <div style={pageFont} className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-[700px] w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("title")}>
                Title <ArrowUpDown className="w-4 h-4 inline-block" />
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("studentsCount")}>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" /> Students <ArrowUpDown className="w-4 h-4 inline-block" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("isPublished")}>
                Status <ArrowUpDown className="w-4 h-4 inline-block" />
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedCourses.map((course) => (
              <tr key={course._id} className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-4 font-medium">{course.title}</td>
                <td className="py-3 px-4">{course.studentsCount || 0}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button onClick={() => handleView(course._id)} className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleEdit(course._id)} className="text-yellow-600 hover:text-yellow-800">
                    <Edit3 className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(course._id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyCourses;
