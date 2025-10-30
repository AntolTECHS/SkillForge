// src/pages/Admin/instructors.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
      const res = await axios.get("/instructors"); // backend: GET /api/instructors (admin)
      // Normalize possible shapes: array or { instructors: [...] }
      const data = res.data ?? res;
      const list = Array.isArray(data) ? data : data?.instructors ?? data?.data ?? [];
      setInstructors(list);
    } catch (err) {
      console.error("Failed to fetch instructors:", err.response?.data || err.message);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this instructor?")) return;
    try {
      await axios.delete(`/instructors/${id}`);
      setInstructors((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete instructor");
    }
  };

  if (loading) return <div className="p-6">Loading instructors…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Instructors</h1>
        <button
          onClick={() => {
            /* TODO: show add modal */
            alert("Add instructor modal (not implemented)");
          }}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          + Add Instructor
        </button>
      </div>

      {instructors.length === 0 ? (
        <div className="text-gray-500">No instructors found.</div>
      ) : (
        <div className="space-y-3">
          {instructors.map((inst) => (
            <div key={inst._id} className="flex items-center gap-4 border rounded-lg p-3 bg-white">
              <img
                src={inst.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"}
                alt={inst.name || inst.email}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{inst.name || "Unnamed"}</div>
                <div className="text-xs text-gray-500">{inst.email}</div>
                {inst.bio && <div className="text-xs text-gray-400 line-clamp-2">{inst.bio}</div>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Edit instructor ${inst._id} (not implemented)`)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(inst._id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
