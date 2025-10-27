import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { PlusCircle, Edit2, Trash2, BookOpen, LayoutDashboard, X } from "lucide-react";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    level: "Beginner",
    category: "",
    price: "",
    image: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userRaw);
    if (user.role !== "instructor") {
      navigate("/");
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/instructor/courses").catch(() => axios.get("/courses"));
      setCourses(res.data?.courses || res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: form.price ? Number(form.price) : 0 };
      if (editingId) {
        await axios.put(`/instructor/courses/${editingId}`, payload).catch(() => axios.put(`/courses/${editingId}`, payload));
        setEditingId(null);
      } else {
        await axios.post("/instructor/courses", payload).catch(() => axios.post("/courses", payload));
      }
      setForm({ title: "", subtitle: "", level: "Beginner", category: "", price: "", image: "", description: "" });
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save course");
    }
  };

  const editCourse = (c) => {
    setEditingId(c._id);
    setForm({
      title: c.title || "",
      subtitle: c.subtitle || "",
      level: c.level || "Beginner",
      category: c.category || "",
      price: c.price ? String(c.price) : "",
      image: c.image || "",
      description: c.description || "",
    });
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course?")) return;
    try {
      await axios.delete(`/instructor/courses/${id}`).catch(() => axios.delete(`/courses/${id}`));
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">Instructor Dashboard</h1>
          </div>
          <button onClick={() => navigate('/')} className="px-3 py-1 border rounded text-sm">Back</button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{editingId ? "Edit Course" : "Add Course"}</h2>
              {editingId && (
                <button onClick={() => { setEditingId(null); setForm({ title: "", subtitle: "", level: "Beginner", category: "", price: "", image: "", description: "" }); }} className="text-sm text-gray-500">Cancel</button>
              )}
            </div>
            <form onSubmit={submitCourse} className="space-y-3">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full px-3 py-2 border rounded" />
              <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Subtitle" className="w-full px-3 py-2 border rounded" />
              <select name="level" value={form.level} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full px-3 py-2 border rounded" />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Price (0 for free)" className="w-full px-3 py-2 border rounded" />
              <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full px-3 py-2 border rounded" />
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Description" className="w-full px-3 py-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">{editingId ? "Save" : "Add Course"}</button>
                <button type="button" onClick={() => { setForm({ title: "", subtitle: "", level: "Beginner", category: "", price: "", image: "", description: "" }); setEditingId(null); }} className="px-4 py-2 border rounded">Clear</button>
              </div>
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Your Courses ({courses.length})</h2>
              <div className="text-sm text-gray-500">Instructors can add and manage their own courses here</div>
            </div>

            {courses.length === 0 ? (
              <div className="text-gray-500">No courses yet.</div>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c._id} className="flex items-center gap-4 border rounded p-3">
                    <img src={c.image || "https://via.placeholder.com/120x80"} alt={c.title} className="w-28 h-16 rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-gray-500">{c.subtitle} • {c.level} • {c.category}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/courses/${c._id}`)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">View</button>
                      <button onClick={() => editCourse(c)} className="px-3 py-1 bg-gray-100 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteCourse(c._id)} className="px-3 py-1 bg-red-600 text-white rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
