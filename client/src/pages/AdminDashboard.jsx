// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios"; // <-- adjust this import if your axios instance is elsewhere
import { Trash2, Edit2, PlusCircle } from "lucide-react";

/**
 * Admin dashboard with tabs:
 * - Instructors (add/view/edit/delete)
 * - Courses (add/view/edit/delete)
 * - Users (view/delete/change role)
 * - Settings (simple)
 *
 * Backend endpoints assumed:
 * GET    /admin/instructors   (or /instructors)
 * POST   /admin/instructors
 * PUT    /admin/instructors/:id
 * DELETE /admin/instructors/:id
 *
 * GET    /admin/courses
 * POST   /admin/courses
 * PUT    /admin/courses/:id
 * DELETE /admin/courses/:id
 *
 * GET    /admin/users
 * PUT    /admin/users/:id    (for role updates)
 * DELETE /admin/users/:id
 *
 * Protect these routes server-side for admin only.
 */

const TABS = ["Instructors", "Courses", "Users", "Settings"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Instructors");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // data
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  // form states
  const [instructorForm, setInstructorForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    image: "",
  });

  const [courseForm, setCourseForm] = useState({
    title: "",
    subtitle: "",
    organization: "",
    teacherId: "", // link to instructor
    level: "Beginner",
    category: "General",
    price: "",
    image: "",
  });

  // edit mode
  const [editingInstructorId, setEditingInstructorId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // parallel fetch
      const [insRes, coursesRes, usersRes] = await Promise.all([
        axios.get("/admin/instructors").catch(() => axios.get("/instructors")),
        axios.get("/admin/courses").catch(() => axios.get("/courses")),
        axios.get("/admin/users").catch(() => axios.get("/users")),
      ]);

      setInstructors(insRes.data?.instructors || insRes.data || []);
      setCourses(coursesRes.data?.courses || coursesRes.data || []);
      setUsers(usersRes.data?.users || usersRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------- Instructors logic --------------------- */
  const handleInstructorChange = (e) =>
    setInstructorForm({ ...instructorForm, [e.target.name]: e.target.value });

  const submitInstructor = async (e) => {
    e.preventDefault();
    try {
      if (editingInstructorId) {
        await axios.put(`/admin/instructors/${editingInstructorId}`, instructorForm).catch(() =>
          axios.put(`/instructors/${editingInstructorId}`, instructorForm)
        );
        setEditingInstructorId(null);
      } else {
        await axios.post("/admin/instructors", instructorForm).catch(() =>
          axios.post("/instructors", instructorForm)
        );
      }
      setInstructorForm({ name: "", email: "", password: "", bio: "", image: "" });
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving instructor");
    }
  };

  const editInstructor = (inst) => {
    setEditingInstructorId(inst._id);
    setInstructorForm({
      name: inst.name || "",
      email: inst.email || "",
      password: "", // leave blank unless admin wants to change
      bio: inst.bio || "",
      image: inst.image || "",
    });
    setActiveTab("Instructors");
  };

  const deleteInstructor = async (id) => {
    if (!confirm("Delete this instructor? This will not delete their courses automatically.")) return;
    try {
      await axios.delete(`/admin/instructors/${id}`).catch(() => axios.delete(`/instructors/${id}`));
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete instructor");
    }
  };

  /* --------------------- Courses logic --------------------- */
  const handleCourseChange = (e) =>
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });

  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...courseForm,
        price: courseForm.price ? Number(courseForm.price) : 0,
      };
      if (editingCourseId) {
        await axios.put(`/admin/courses/${editingCourseId}`, payload).catch(() =>
          axios.put(`/courses/${editingCourseId}`, payload)
        );
        setEditingCourseId(null);
      } else {
        await axios.post("/admin/courses", payload).catch(() => axios.post("/courses", payload));
      }
      setCourseForm({
        title: "",
        subtitle: "",
        organization: "",
        teacherId: "",
        level: "Beginner",
        category: "General",
        price: "",
        image: "",
      });
      await fetchAll();
      setActiveTab("Courses");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving course");
    }
  };

  const editCourse = (course) => {
    setEditingCourseId(course._id);
    setCourseForm({
      title: course.title || "",
      subtitle: course.subtitle || "",
      organization: course.organization || "",
      teacherId: course.teacher?._id || course.teacher || "",
      level: course.level || "Beginner",
      category: course.category || "General",
      price: course.price ? String(course.price) : "",
      image: course.image || "",
    });
    setActiveTab("Courses");
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course?")) return;
    try {
      await axios.delete(`/admin/courses/${id}`).catch(() => axios.delete(`/courses/${id}`));
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete course");
    }
  };

  /* --------------------- Users logic --------------------- */
  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`/admin/users/${id}`).catch(() => axios.delete(`/users/${id}`));
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const updateUserRole = async (id, newRole) => {
    try {
      await axios.put(`/admin/users/${id}`, { role: newRole }).catch(() => axios.put(`/users/${id}`, { role: newRole }));
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to update user role");
    }
  };

  /* --------------------- UI small helpers --------------------- */

  if (loading) return <div className="p-8">Loading admin data…</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Full platform management</div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <nav className="flex gap-3 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === t
                ? "bg-blue-700 text-white shadow"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div>
        {/* ---------------- Instructors Tab ---------------- */}
        {activeTab === "Instructors" && (
          <section>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold"> {editingInstructorId ? "Edit Instructor" : "Add Instructor"}</h2>
                  {editingInstructorId && (
                    <button
                      onClick={() => {
                        setEditingInstructorId(null);
                        setInstructorForm({ name: "", email: "", password: "", bio: "", image: "" });
                      }}
                      className="text-sm text-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={submitInstructor} className="space-y-3">
                  <input
                    name="name"
                    value={instructorForm.name}
                    onChange={handleInstructorChange}
                    placeholder="Full name"
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    name="email"
                    type="email"
                    value={instructorForm.email}
                    onChange={handleInstructorChange}
                    placeholder="Email"
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    name="password"
                    type="password"
                    value={instructorForm.password}
                    onChange={handleInstructorChange}
                    placeholder={editingInstructorId ? "Leave blank to keep existing password" : "Password"}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    name="image"
                    value={instructorForm.image}
                    onChange={handleInstructorChange}
                    placeholder="Image URL"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <textarea
                    name="bio"
                    value={instructorForm.bio}
                    onChange={handleInstructorChange}
                    rows="3"
                    placeholder="Short bio"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="flex items-center gap-3">
                    <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
                      {editingInstructorId ? "Save Changes" : "Add Instructor"}
                    </button>
                    {editingInstructorId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInstructorId(null);
                          setInstructorForm({ name: "", email: "", password: "", bio: "", image: "" });
                        }}
                        className="px-3 py-2 bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Instructors ({instructors.length})</h3>
                {instructors.length === 0 ? (
                  <p className="text-gray-500">No instructors yet.</p>
                ) : (
                  <div className="space-y-3">
                    {instructors.map((inst) => (
                      <div key={inst._id} className="flex items-center gap-4 border rounded p-3">
                        <img
                          src={inst.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"}
                          alt={inst.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{inst.name}</div>
                          <div className="text-xs text-gray-500">{inst.email}</div>
                          <div className="text-xs text-gray-400 line-clamp-2">{inst.bio}</div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editInstructor(inst)}
                            className="px-2 py-2 bg-gray-100 rounded hover:bg-gray-200"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteInstructor(inst._id)}
                            className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- Courses Tab ---------------- */}
        {activeTab === "Courses" && (
          <section>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Course Form */}
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">{editingCourseId ? "Edit Course" : "Add Course"}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <PlusCircle className="w-4 h-4" />
                    <span>{courses.length} total</span>
                  </div>
                </div>

                <form onSubmit={submitCourse} className="space-y-3">
                  <input
                    name="title"
                    value={courseForm.title}
                    onChange={handleCourseChange}
                    placeholder="Course Title"
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    name="subtitle"
                    value={courseForm.subtitle}
                    onChange={handleCourseChange}
                    placeholder="Subtitle (short)"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    name="organization"
                    value={courseForm.organization}
                    onChange={handleCourseChange}
                    placeholder="Organization"
                    className="w-full px-3 py-2 border rounded"
                  />

                  <select
                    name="teacherId"
                    value={courseForm.teacherId}
                    onChange={handleCourseChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Select instructor (required)</option>
                    {instructors.map((ins) => (
                      <option key={ins._id} value={ins._id}>
                        {ins.name} — {ins.email}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="level"
                      value={courseForm.level}
                      onChange={handleCourseChange}
                      className="px-3 py-2 border rounded"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>

                    <input
                      name="category"
                      value={courseForm.category}
                      onChange={handleCourseChange}
                      placeholder="Category (e.g. Popular, New)"
                      className="px-3 py-2 border rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="price"
                      value={courseForm.price}
                      onChange={handleCourseChange}
                      placeholder="Price (leave empty for free)"
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      name="image"
                      value={courseForm.image}
                      onChange={handleCourseChange}
                      placeholder="Image URL"
                      className="px-3 py-2 border rounded"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
                      {editingCourseId ? "Save Changes" : "Add Course"}
                    </button>
                    {editingCourseId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCourseId(null);
                          setCourseForm({
                            title: "",
                            subtitle: "",
                            organization: "",
                            teacherId: "",
                            level: "Beginner",
                            category: "General",
                            price: "",
                            image: "",
                          });
                        }}
                        className="px-3 py-2 bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Courses list */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Courses ({courses.length})</h3>
                {courses.length === 0 ? (
                  <p className="text-gray-500">No courses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {courses.map((c) => (
                      <div key={c._id} className="flex items-center gap-4 border rounded p-3">
                        <img
                          src={c.image || "https://img.freepik.com/free-vector/gradient-fluid-abstract-background_23-2149187843.jpg"}
                          alt={c.title}
                          className="w-16 h-12 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-gray-500">{c.organization} • {c.level}</div>
                          <div className="text-xs text-gray-400 line-clamp-2">{c.subtitle}</div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => editCourse(c)} className="px-2 py-2 bg-gray-100 rounded hover:bg-gray-200" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCourse(c._id)} className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-500" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- Users Tab ---------------- */}
        {activeTab === "Users" && (
          <section>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold mb-4">Users ({users.length})</h2>
              {users.length === 0 ? (
                <p className="text-gray-500">No users.</p>
              ) : (
                <div className="grid gap-3">
                  {users.map((u) => (
                    <div key={u._id} className="flex items-center gap-4 border rounded p-3">
                      <img
                        src={u.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"}
                        alt={u.name || u.email}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{u.name || u.email}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={u.role || "student"}
                          onChange={(e) => updateUserRole(u._id, e.target.value)}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button onClick={() => deleteUser(u._id)} className="px-2 py-2 bg-red-600 text-white rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------------- Settings Tab ---------------- */}
        {activeTab === "Settings" && (
          <section>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold mb-3">Platform Settings</h2>
              <p className="text-sm text-gray-600">
                Simple settings placeholder — you can add toggles for registration, email config, featured courses, etc.
              </p>
              {/* Add real settings UI as needed */}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
