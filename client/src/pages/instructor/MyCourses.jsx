import React, { useEffect, useState } from "react";
import { Edit3, Trash2, Eye, User } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 5;
  const navigate = useNavigate();

  const pageFont = {
    fontFamily:
      "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  };

  // Fetch instructor courses with studentsCount
  const fetchCourses = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/instructor/my-courses?page=${page}&limit=${coursesPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourses(response.data.courses);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      alert("Failed to load courses. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  // Filter courses by search & status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && course.isPublished) ||
      (statusFilter === "Draft" && !course.isPublished);
    return matchesSearch && matchesStatus;
  });

  // Navigation handlers
  const handleView = (id) => navigate(`/courses/${id}`);
  const handleEdit = (id) => navigate(`/instructor/course/edit/${id}`);

  // Delete course
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/instructor/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error("Failed to delete course", err);
      alert("Failed to delete course.");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-xl font-semibold" style={pageFont}>
        Loading courses...
      </div>
    );

  return (
    <div className="p-6" style={pageFont}>
      <h1 className="text-3xl font-bold mb-6" style={pageFont}>
        My Courses
      </h1>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/3"
          style={pageFont}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
          style={pageFont}
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <p className="text-gray-600" style={pageFont}>
          No courses found.
        </p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full border-collapse" style={pageFont}>
            <thead className="bg-gray-100 text-left text-gray-600" style={pageFont}>
              <tr>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4 flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-600 inline" />
                  Students
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody style={pageFont}>
              {filteredCourses.map((course) => (
                <tr key={course._id} className="border-b hover:bg-gray-50">
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
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleView(course._id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit3 className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            style={pageFont}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-lg hover:bg-gray-100 ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
              style={pageFont}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            style={pageFont}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
