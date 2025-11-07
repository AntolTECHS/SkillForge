
// AdminDashboard.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

import { motion } from "framer-motion";
import {
  Menu,
  X,
  Trash2,
  Edit2,
  Users,
  BookOpen,
  Settings,
  UserPlus,
  LayoutDashboard,
  DollarSign,
  CalendarCheck,
  BarChart2,
  Check,
  XCircle,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

/* -------------------------
   Useful constants
   ------------------------- */
const DEFAULT_PLACEHOLDER = "https://placehold.co/120x80";

/* -------------------------
   Pure helpers (defined before hooks so no hoisting issues)
   ------------------------- */
function pick(obj, paths = []) {
  if (!obj) return undefined;
  for (const p of paths) {
    const parts = p.split(".");
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (cur == null) { ok = false; break; }
      const cleanPart = part.replace(/\?$/, "");
      cur = cur[cleanPart];
    }
    if (ok && cur !== undefined && cur !== null) return cur;
  }
  return undefined;
}

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const candidates = [
    data.enrollments,
    data.results,
    data.data,
    data.rows,
    data.items,
    data.documents,
    data.records,
    data.list,
    data.courses,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  if (data.data && typeof data.data === "object") {
    const nested = normalizeList(data.data);
    if (nested.length) return nested;
  }

  if (typeof data === "object") return [data];
  return [];
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return String(d);
  }
}

/* -------------------------
   UI constants & helpers
   ------------------------- */
const NAV_ITEMS = [
  { key: "Overview", Icon: BarChart2 },
  { key: "Instructors", Icon: UserPlus },
  { key: "Courses", Icon: BookOpen },
  { key: "Enrollments", Icon: Users },
  { key: "Attendance", Icon: CalendarCheck },
  { key: "Students", Icon: Users },
  { key: "Payments", Icon: DollarSign },
  { key: "Certificates", Icon: Award },
  { key: "Settings", Icon: Settings },
];

function colorClasses(theme = "blue") {
  const map = {
    blue: {
      gradient: "from-blue-50 to-blue-100",
      icon: "text-blue-700",
      accentBg: "bg-gradient-to-r from-blue-50 to-blue-100",
      text: "text-blue-900",
    },
    teal: {
      gradient: "from-teal-50 to-teal-100",
      icon: "text-teal-700",
      accentBg: "bg-gradient-to-r from-teal-50 to-teal-100",
      text: "text-teal-900",
    },
    purple: {
      gradient: "from-violet-50 to-violet-100",
      icon: "text-violet-700",
      accentBg: "bg-gradient-to-r from-violet-50 to-violet-100",
      text: "text-violet-900",
    },
    amber: {
      gradient: "from-amber-50 to-amber-100",
      icon: "text-amber-700",
      accentBg: "bg-gradient-to-r from-amber-50 to-amber-100",
      text: "text-amber-900",
    },
  };
  return map[theme] ?? map.blue;
}

function StatCard({ title, value, subtitle, icon: Icon, theme = "blue" }) {
  const cls = colorClasses(theme);
  return (
    <motion.div whileHover={{ y: -4 }} className={`bg-white/95 backdrop-blur-sm ring-1 ring-gray-100 rounded-2xl p-5 shadow-lg`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${cls.accentBg}`}>
          {Icon && <Icon className={`w-6 h-6 ${cls.icon}`} />}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{title}</div>
          <div className={`text-2xl font-semibold ${cls.text}`}>{value}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function Card({ children, className = "" }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className={`bg-white/95 backdrop-blur-sm ring-1 ring-gray-100 rounded-2xl p-6 shadow-lg ${className}`}>
      {children}
    </motion.div>
  );
}

/* -------------------------
   Minimal InstructorForm component
   ------------------------- */

/* -------------------------
   InstructorForm (admin can set instructor password)
   ------------------------- */
function InstructorForm({ initial = null, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
    password: "",
  });

  const [setPassword, setSetPassword] = useState(!initial); // true when creating
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        email: initial.email || "",
        bio: initial.bio || "",
        image: initial.image || "",
        password: "",
      });
      setSetPassword(false);
    } else {
      setForm({
        name: "",
        email: "",
        bio: "",
        image: "",
        password: "",
      });
      setSetPassword(true);
    }
  }, [initial]);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const genPassword = (length = 12) => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%*?";
    try {
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, (x) => chars[x % chars.length]).join("");
    } catch {
      let out = "";
      for (let i = 0; i < length; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
      return out;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name?.trim() || !form.email?.trim()) {
      alert("Name and email are required.");
      return;
    }

    if (setPassword) {
      if (!form.password || form.password.length < 8) {
        alert("Password is required and must be at least 8 characters.");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio,
      image: form.image,
    };
    if (setPassword && form.password) payload.password = form.password;

    try {
      setSaving(true);
      if (onSave) {
        await onSave(payload);
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3">{initial ? "Edit Instructor" : "Add Instructor"}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600">Image URL</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Password controls */}
        <div className="mt-2">
          <div className="flex items-center gap-3 mb-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={setPassword}
                onChange={() => setSetPassword((s) => !s)}
              />
              <span className="text-sm">{initial ? "Set / Reset password" : "Set password for instructor"}</span>
            </label>

            {setPassword && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const p = genPassword(12);
                    setForm((s) => ({ ...s, password: p }));
                    copyToClipboard(p);
                    // optionally show a small confirmation
                  }}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(form.password)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          {setPassword && (
            <div>
              <label className="block text-xs text-gray-600">Password</label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter a secure password (min 8 chars)"
                autoComplete={initial ? "new-password" : "new-password"}
                aria-describedby="passwordHelp"
              />
              <div id="passwordHelp" className="text-xs text-gray-400 mt-1">
                {form.password ? `${form.password.length} characters` : "Password not set"}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1 bg-blue-700 text-white rounded"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
/* -------------------------
   Minimal CertificateGenerator component
   ------------------------- */
function CertificateGenerator({ users = [], courses = [], onGenerate }) {
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [grade, setGrade] = useState("");

  const handleGenerate = () => {
    if (!userId || !courseId) {
      alert("Select user and course");
      return;
    }
    onGenerate && onGenerate({ userId, courseId, grade });
    setGrade("");
    setUserId("");
    setCourseId("");
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">Generate Certificate</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">Select user</option>
          {users.map((u) => <option key={u._id ?? u.id ?? u.email} value={u._id ?? u.id ?? u.email}>{u.name || u.email}</option>)}
        </select>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">Select course</option>
          {courses.map((c) => <option key={c._id ?? c.id} value={c._id ?? c.id}>{c.title}</option>)}
        </select>
        <input placeholder="Grade (optional)" value={grade} onChange={(e) => setGrade(e.target.value)} className="px-3 py-2 border rounded" />
      </div>
      <div className="mt-3">
        <button onClick={handleGenerate} className="px-3 py-1 bg-green-600 text-white rounded">Generate</button>
      </div>
    </div>
  );
}

/* -------------------------
   Course edit form modal
   ------------------------- */
function CourseFormModal({ course, onClose, onSave, canEditInstructorList = [] }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    instructorId: "",
  });

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || "",
        description: course.description || "",
        price: typeof course.price !== 'undefined' ? course.price : 0,
        category: course.category || "",
        image: course.image || course.thumbnail || "",
        instructorId: pick(course, ['instructor._id','instructorId','teacherId','instructorId']) || course.instructor || "",
      });
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave(form);
  };

  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-lg font-semibold">Edit Course</h4>
          <button onClick={onClose} className="text-gray-500"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="px-3 py-2 border rounded" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="px-3 py-2 border rounded" />
          <div className="grid grid-cols-2 gap-2">
            <input name="price" value={form.price} onChange={handleChange} type="number" className="px-3 py-2 border rounded" />
            <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="px-3 py-2 border rounded" />
          </div>
          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="px-3 py-2 border rounded" />

          {canEditInstructorList && canEditInstructorList.length > 0 && (
            <select name="instructorId" value={form.instructorId} onChange={handleChange} className="px-3 py-2 border rounded">
              <option value="">Select instructor</option>
              {canEditInstructorList.map((i) => (
                <option key={i._id ?? i.id} value={i._id ?? i.id}>{i.name || i.email}</option>
              ))}
            </select>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-blue-700 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------
   Main admin dashboard component
   ------------------------- */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState({});
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [editingInstructor, setEditingInstructor] = useState(null);
  const [processingIds, setProcessingIds] = useState([]); // track ids for button disabling

  // Students tab state
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const [studentModal, setStudentModal] = useState(null);

  // Course edit modal state
  const [editingCourse, setEditingCourse] = useState(null);

  const navigate = useNavigate();
  const pollRef = useRef(null);

  // determine current user and role
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);
  const currentRole = (currentUser.role || '').toString().toLowerCase();

  const canEditCourse = useCallback((course) => {
    if (!course) return false;
    if (currentRole === 'admin') return true;
    if (currentRole === 'instructor') {
      // check common instructor id/email fields on course
      const cid = pick(course, ['instructor._id','instructorId','teacherId','instructorId','teacherId']);
      const cemail = pick(course, ['instructor.email','instructorEmail','teacherEmail']);
      if (cid && (String(cid) === String(currentUser._id) || String(cid) === String(currentUser.id))) return true;
      if (cemail && currentUser.email && String(cemail).toLowerCase() === String(currentUser.email).toLowerCase()) return true;
    }
    return false;
  }, [currentRole, currentUser]);

  /* -------------------------
     Fetch helpers
     ------------------------- */
  const fetchAllEnrollments = useCallback(async () => {
    try {
      const tryUrls = [
        "/admin/enrollments?limit=10000",
        "/enrollments?limit=10000",
        "/admin/enrollments?perPage=10000",
        "/enrollments?perPage=10000",
      ];

      for (const url of tryUrls) {
        try {
          const res = await axios.get(url);
          const d = res.data ?? res;
          const list = normalizeList(d);
          if (list.length) {
            setEnrollments(list);
            return list;
          }
        } catch {
          // ignore and try next
        }
      }

      // fallback: paginated fetch
      const accumulated = [];
      let page = 1;
      const pageSize = 200;
      for (let i = 0; i < 25; i++) {
        try {
          const res = await axios
            .get(`/admin/enrollments?page=${page}&limit=${pageSize}`)
            .catch(() => axios.get(`/enrollments?page=${page}&limit=${pageSize}`));
          const d = res.data ?? res;
          const list = normalizeList(d);
          if (!list || list.length === 0) break;
          accumulated.push(...list);
          if (list.length < pageSize) break;
          page += 1;
        } catch {
          break;
        }
      }

      if (accumulated.length) {
        setEnrollments(accumulated);
        return accumulated;
      }
    } catch (e) {
      console.warn("fetchAllEnrollments failed", e);
    }
    return [];
  }, []);

  async function fetchResource(primary, fallback, defaultValue) {
    try {
      const res = await axios.get(primary);
      return res.data ?? res;
    } catch {
      if (fallback) {
        try {
          const res2 = await axios.get(fallback);
          return res2.data ?? res2;
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    }
  }

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overviewData,
        instructorsData,
        coursesData,
        enrollmentsData,
        attendanceData,
        assignmentsData,
        paymentsData,
        certificatesData,
        usersData,
      ] = await Promise.all([
        fetchResource("/admin/overview", null, {}),
        fetchResource("/admin/instructors", "/instructors", []),
        // prefer public /courses first, fallback to /admin/courses
        fetchResource("/courses", "/admin/courses", []),
        fetchResource("/admin/enrollments", "/enrollments", []),
        fetchResource("/admin/attendance", "/attendance", []),
        fetchResource("/admin/assignments", "/assignments", []),
        fetchResource("/admin/payments", "/payments", []),
        fetchResource("/admin/certificates", "/certificates", []),
        fetchResource("/admin/users", "/users", []),
      ]);

      setOverview(overviewData || {});

      const normalizedInstructors = Array.isArray(instructorsData)
        ? instructorsData
        : instructorsData?.instructors ?? instructorsData?.data ?? instructorsData ?? [];
      setInstructors(normalizedInstructors);

      const normalizedCourses = Array.isArray(coursesData)
        ? coursesData
        : coursesData?.courses ?? coursesData?.data ?? coursesData ?? [];
      setCourses(normalizedCourses);

      // if nothing found, try common /api prefixed endpoints (some backends expose under /api/)
      if (!normalizedCourses || normalizedCourses.length === 0) {
        try {
          const resApi = await axios.get('/api/courses');
          const apiCourses = normalizeList(resApi.data ?? resApi);
          if (apiCourses && apiCourses.length) {
            setCourses(apiCourses);
          } else {
            // try admin api path
            const resApi2 = await axios.get('/api/admin/courses').catch(() => ({}));
            const apiCourses2 = normalizeList(resApi2.data ?? resApi2);
            if (apiCourses2 && apiCourses2.length) setCourses(apiCourses2);
          }
        } catch (e) {
          // ignore if no /api endpoints
        }
      }

      const eList = normalizeList(enrollmentsData);
      if (eList.length) setEnrollments(eList);
      else {
        const attempted = await fetchAllEnrollments();
        if (!attempted.length) setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data ?? []);
      }

      setAttendance(Array.isArray(attendanceData) ? attendanceData : attendanceData?.data ?? []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.data ?? []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData?.data ?? []);
      setCertificates(Array.isArray(certificatesData) ? certificatesData : certificatesData?.data ?? []);

      const normalizedUsers = Array.isArray(usersData) ? usersData : usersData?.users ?? usersData?.data ?? usersData ?? [];
      setUsers(normalizedUsers);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  }, [fetchAllEnrollments]);

  /* -------------------------
     Effects
     ------------------------- */
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await fetchAllData();
    };
    run();
    return () => {
      mounted = false;
    };
  }, [fetchAllData]);

  // close sidebar on tab change
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  // poll for "real-time" while on Overview
  useEffect(() => {
    if (activeTab === "Overview") {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        fetchAllData().catch(() => {});
      }, 10000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activeTab, fetchAllData]);

  /* -------------------------
     Actions (CRUD and helpers)
     ------------------------- */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const addProcessing = (id) => setProcessingIds((s) => Array.from(new Set([...s, id])));
  const removeProcessing = (id) => setProcessingIds((s) => s.filter((x) => x !== id));
  const isProcessing = (id) => processingIds.includes(id);

  const saveInstructor = useCallback(
    async (form) => {
      try {
        if (editingInstructor && editingInstructor._id) {
          await axios.put(`/admin/instructors/${editingInstructor._id}`, form).catch(() => axios.put(`/instructors/${editingInstructor._id}`, form));
          setEditingInstructor(null);
        } else {
          await axios.post("/admin/instructors", form).catch(() => axios.post("/instructors", form));
        }
        await fetchAllData();
        setActiveTab("Instructors");
      } catch (err) {
        alert(err.response?.data?.message || "Error saving instructor");
      }
    },
    [editingInstructor, fetchAllData]
  );

  const editInstructor = useCallback((inst) => {
    setEditingInstructor(inst);
    setActiveTab("Instructors");
  }, []);

  const deleteInstructor = useCallback(
    async (id) => {
      if (!confirm("Delete this instructor? This will not automatically delete their courses.")) return;
      addProcessing(id);
      try {
        await axios.delete(`/admin/instructors/${id}`).catch(() => axios.delete(`/instructors/${id}`));
        await fetchAllData();
      } catch (err) {
        alert("Failed to delete instructor");
      } finally {
        removeProcessing(id);
      }
    },
    [fetchAllData]
  );

  const unenrollStudent = useCallback(
    async (enrollmentId) => {
      if (!confirm("Unenroll this student?")) return;
      addProcessing(enrollmentId);
      try {
        await axios.delete(`/admin/enrollments/${enrollmentId}`).catch(() => axios.delete(`/enrollments/${enrollmentId}`));
        await fetchAllData();
      } catch (err) {
        alert("Failed to unenroll student");
      } finally {
        removeProcessing(enrollmentId);
      }
    },
    [fetchAllData]
  );

  const markAttendance = useCallback(
    async (courseId, date, studentId, present = true) => {
      const key = `${courseId}-${studentId}-${date}`;
      addProcessing(key);
      try {
        await axios.post("/instructor/attendance", { courseId, date, studentId, present }).catch(() => axios.post("/admin/attendance", { courseId, date, studentId, present }));
        await fetchAllData();
      } catch (err) {
        alert("Failed to mark attendance");
      } finally {
        removeProcessing(key);
      }
    },
    [fetchAllData]
  );

  const gradeSubmission = useCallback(
    async (submissionId, grade) => {
      addProcessing(submissionId);
      try {
        await axios.post(`/admin/assignments/${submissionId}/grade`, { grade });
        await fetchAllData();
      } catch (err) {
        alert("Failed to grade");
      } finally {
        removeProcessing(submissionId);
      }
    },
    [fetchAllData]
  );

  const approvePayout = useCallback(
    async (paymentId) => {
      if (!confirm("Approve payout to instructor?")) return;
      addProcessing(paymentId);
      try {
        await axios.post(`/admin/payments/${paymentId}/approve`);
        await fetchAllData();
      } catch (err) {
        alert("Failed to approve payout");
      } finally {
        removeProcessing(paymentId);
      }
    },
    [fetchAllData]
  );

  const refundPayment = useCallback(
    async (paymentId) => {
      if (!confirm("Refund this payment?")) return;
      addProcessing(paymentId);
      try {
        await axios.post(`/admin/payments/${paymentId}/refund`).catch(() => axios.post(`/payments/${paymentId}/refund`));
        await fetchAllData();
      } catch (err) {
        alert("Failed to refund");
      } finally {
        removeProcessing(paymentId);
      }
    },
    [fetchAllData]
  );

  // COURSES SYNC: attempts several likely endpoints, then refreshes data
  const handleSyncCoursera = useCallback(async () => {
    if (!confirm("Fetch & save Coursera courses to the platform?")) return;
    addProcessing("sync-coursera");
    try {
      const syncEndpoints = [
        "/admin/courses/sync",
        "/courses/sync",
        "/admin/sync-coursera",
        "/sync-coursera",
        "/admin/import-coursera",
        "/import-coursera",
        "/admin/courses/import",
        "/courses/import",
      ];

      let ok = false;
      for (const url of syncEndpoints) {
        try {
          await axios.post(url);
          ok = true;
          break;
        } catch (e) {
          // try next
        }
      }

      if (!ok) throw new Error("No sync endpoint succeeded");

      await fetchAllData();
      alert("Coursera sync completed.");
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Coursera sync failed. Check server logs or try the import script.");
    } finally {
      removeProcessing("sync-coursera");
    }
  }, [fetchAllData]);

  const generateCertificate = useCallback(
    async ({ userId, courseId, grade }) => {
      if (!userId || !courseId) {
        alert("student and course required");
        return;
      }
      try {
        await axios.post("/admin/certificates/generate", { userId, courseId, grade }).catch(() => axios.post("/certificates/generate", { userId, courseId, grade }));
        await fetchAllData();
        alert("Certificate generation requested.");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to generate certificate");
      }
    },
    [fetchAllData]
  );

  const revokeCertificateLocal = useCallback(
    async (certId) => {
      if (!confirm("Revoke this certificate?")) return;
      addProcessing(certId);
      try {
        await axios.delete(`/admin/certificates/${certId}`).catch(() => axios.delete(`/certificates/${certId}`));
        await fetchAllData();
      } catch (err) {
        alert("Failed to revoke certificate");
      } finally {
        removeProcessing(certId);
      }
    },
    [fetchAllData]
  );

  const updateUserRole = useCallback(
    async (id, role) => {
      addProcessing(id);
      try {
        await axios.put(`/admin/users/${id}`, { role }).catch(() => axios.put(`/users/${id}`, { role }));
        await fetchAllData();
      } catch (err) {
        alert("Failed to update user role");
      } finally {
        removeProcessing(id);
      }
    },
    [fetchAllData]
  );

  const deleteUser = useCallback(
    async (id) => {
      if (!confirm("Delete this user?")) return;
      addProcessing(id);
      try {
        await axios.delete(`/admin/users/${id}`).catch(() => axios.delete(`/users/${id}`));
        await fetchAllData();
      } catch (err) {
        alert("Failed to delete user");
      } finally {
        removeProcessing(id);
      }
    },
    [fetchAllData]
  );

  // update course: admin or instructor (their own courses)
  
  // update course: admin or instructor (their own courses)
  const saveCourse = useCallback(async (updatedFields) => {
    if (!editingCourse) return;
    addProcessing(editingCourse._id ?? editingCourse.id ?? 'course-save');
    try {
      const id = editingCourse._id ?? editingCourse.id;
      // Common endpoint candidates (various prefix combos)
      const endpoints = [
        `/admin/courses/${id}`,
        `/courses/${id}`,
        `/instructor/courses/${id}`,
        `/api/admin/courses/${id}`,
        `/api/courses/${id}`,
        `/api/instructor/courses/${id}`,
      ];

      const tried = [];
      let success = false;
      const base = axios?.defaults?.baseURL || "";

      // helper to attempt a single URL (absolute or relative)
      const attempt = async (url) => {
        if (!url || tried.includes(url)) return false;
        tried.push(url);
        try {
          console.log("Attempting course update:", url);
          // If url looks absolute (starts with http) axios will use it as-is.
          await axios.put(url, updatedFields);
          return true;
        } catch (err) {
          // record failures for debugging
          console.warn("Update attempt failed for", url, err?.response?.status, err?.response?.data);
          return false;
        }
      };

      for (const ep of endpoints) {
        // try as-is
        if (await attempt(ep)) { success = true; break; }

        // try stripping leading /api if present and server might already mount /api as baseURL
        if (ep.startsWith("/api")) {
          const withoutApi = ep.replace(/^\/api/, "");
          if (await attempt(withoutApi)) { success = true; break; }
        }

        // try absolute URL if axios.defaults.baseURL is set
        if (base) {
          try {
            const baseNoSlash = base.replace(/\/$/, "");
            const full = baseNoSlash + ep;
            if (await attempt(full)) { success = true; break; }

            // also try when base contains /api and ep has /api (to avoid double /api)
            if (baseNoSlash.includes("/api")) {
              const baseStripApi = baseNoSlash.replace(/\/api\/?$/, "");
              const epStripApi = ep.replace(/^\/api/, "");
              const altFull = baseStripApi + epStripApi;
              if (await attempt(altFull)) { success = true; break; }
            }
          } catch (e) {
            // ignore
          }
        }
      }

      // if no PUT succeeded, try PATCH on tried URLs
      if (!success) {
        for (const url of tried) {
          try {
            console.log("Attempting PATCH fallback:", url);
            await axios.patch(url, updatedFields);
            success = true;
            break;
          } catch (e) {
            // continue
          }
        }
      }

      if (!success) throw new Error("No working course update endpoint found. Tried: " + JSON.stringify(tried.slice(0, 20)));

      await fetchAllData();
      setEditingCourse(null);
      alert("Course updated");
    } catch (err) {
      console.error("Failed to update course", err);
      alert(err.response?.data?.message || err.message || "Failed to update course");
    } finally {
      removeProcessing(editingCourse._id ?? editingCourse.id ?? "course-save");
    }
  }, [editingCourse, fetchAllData]);


  // bulk student actions
  const toggleSelectStudent = (id) => {
    setSelectedStudents((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectAllStudents(false);
      return next;
    });
  };

  const toggleSelectAll = (list) => {
    if (!selectAllStudents) {
      const all = new Set(list.map((u) => u._id ?? u.id ?? u.email));
      setSelectedStudents(all);
      setSelectAllStudents(true);
    } else {
      setSelectedStudents(new Set());
      setSelectAllStudents(false);
    }
  };

  const exportSelectedAsCSV = () => {
    const rows = [];
    const ids = Array.from(selectedStudents);
    const subset = users.filter((u) => ids.includes(u._id ?? u.id ?? u.email));
    if (subset.length === 0) {
      alert("No students selected for export");
      return;
    }

    const header = ["id", "name", "email", "role"];
    rows.push(header.join(","));
    subset.forEach((u) => {
      rows.push([u._id ?? u.id ?? "", (u.name || "").replace(/,/g, ""), (u.email || "").replace(/,/g, ""), (u.role || "student")].join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const bulkDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedStudents.size} selected user(s)? This action cannot be undone.`)) return;
    const ids = Array.from(selectedStudents);
    for (const id of ids) {
      addProcessing(id);
      try {
        await axios.delete(`/admin/users/${id}`).catch(() => axios.delete(`/users/${id}`));
      } catch (err) {
        console.warn("failed deleting", id, err);
      } finally {
        removeProcessing(id);
      }
    }
    setSelectedStudents(new Set());
    await fetchAllData();
  };

  /* -------------------------
     Analytics helpers & chart
     ------------------------- */
  const getLastNMonths = (n = 6) => {
    const res = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      res.push(d);
    }
    return res;
  };

  const computeInvolvement = ({ months = 6 } = {}) => {
    const buckets = getLastNMonths(months).map((d) => ({
      monthLabel: d.toLocaleString(undefined, { month: "short", year: "numeric" }),
      instructors: 0,
      courses: 0,
      enrollments: 0,
      attendance: 0,
      assignments: 0,
      payments: 0,
      certificates: 0,
      users: 0,
    }));

    const findBucket = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d)) return null;
      const label = new Date(d.getFullYear(), d.getMonth(), 1).toLocaleString(undefined, { month: "short", year: "numeric" });
      return buckets.find((b) => b.monthLabel === label) ?? null;
    };

    const bump = (list, datePaths, key) => {
      (list || []).forEach((item) => {
        const date = pick(item, datePaths) || item.createdAt || item.created_at || item.date || item.publishedAt || item.paidAt;
        const b = findBucket(date);
        if (b) b[key] += 1;
      });
    };

    bump(instructors, ["createdAt", "created_at", "date"], "instructors");
    bump(courses, ["createdAt", "created_at", "publishedAt", "date"], "courses");
    bump(enrollments, ["createdAt", "enrolledAt", "created_at", "date"], "enrollments");
    bump(attendance, ["date", "createdAt", "created_at"], "attendance");
    bump(assignments, ["createdAt", "created_at", "dueDate", "due_date"], "assignments");
    (payments || []).forEach((p) => {
      const date = pick(p, ["createdAt", "date", "paidAt", "created_at"]) || p.date;
      const b = findBucket(date);
      if (b) b.payments += 1;
    });
    bump(certificates, ["issuedAt", "createdAt", "created_at"], "certificates");
    bump(users, ["createdAt", "created_at", "registeredAt", "date"], "users");

    return buckets;
  };

  const MultiSeriesChart = ({ months = 6 }) => {
    const data = useMemo(() => computeInvolvement({ months }), [
      enrollments,
      instructors,
      courses,
      attendance,
      assignments,
      payments,
      certificates,
      users,
      months,
    ]);

    const series = [
      { key: "enrollments", name: "Enrollments" },
      { key: "users", name: "Users" },
      { key: "instructors", name: "Instructors" },
      { key: "courses", name: "Courses" },
      { key: "attendance", name: "Attendance" },
      { key: "assignments", name: "Assignments" },
      { key: "payments", name: "Payments" },
      { key: "certificates", name: "Certificates" },
    ];

    const strokes = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#7c3aed", "#e11d48"];

    return (
      <Card className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Engagement by section (last {months} months)</h4>
          <div className="text-sm text-gray-500">Curves show monthly counts for each admin tab</div>
        </div>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis />
              <Tooltip />
              <Legend />
              {series.map((s, i) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={strokes[i % strokes.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };

  /* -------------------------
     UI Subcomponents (Sidebar + Tabs)
     ------------------------- */
  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-blue-700">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5" />
          <span>SkillForge Admin</span>
        </h2>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-200 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-6 space-y-1 px-2">
        {NAV_ITEMS.map(({ key, Icon }) => (
          <button key={key} onClick={() => { setActiveTab(key); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-blue-800/60 transition ${activeTab === key ? "bg-white/8 font-semibold" : ""}`}>
            <Icon className="w-5 h-5" />
            <span>{key}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">Logout</button>
      </div>
    </aside>
  );

  // Overview: always use live computed counts (users & enrollments)
  const OverviewTab = () => {
    const preview = (items) => (Array.isArray(items) ? items.slice(0, 3) : []);

    // live counts
    const registeredUsersCount = users.length;

    const uniqueLearnersFromEnrollments = useMemo(() => {
      const s = new Set();
      (enrollments || []).forEach((e) => {
        const sid =
          e.studentId ??
          pick(e, ["student._id", "student.id", "userId", "user._id"]) ??
          e.studentEmail ??
          pick(e, ["student.email", "user.email"]);
        if (sid) s.add(String(sid));
      });
      return s.size;
    }, [enrollments]);

    // computed live count (best-effort)
    const computedCount = Math.max(uniqueLearnersFromEnrollments, registeredUsersCount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Overview (Real-time)</h2>
          <div className="flex gap-2 items-center">
            <button onClick={fetchAllData} className="px-3 py-1 bg-gray-200 rounded text-sm">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <StatCard
            title="Total learners"
            value={computedCount}
            subtitle={"Live computed (users & enrollments)"}
            icon={Users}
            theme="blue"
          />

          <StatCard title="Registered users (real-time)" value={registeredUsersCount} subtitle="From users API" icon={Users} theme="teal" />
          <StatCard title="Unique enrolled learners" value={uniqueLearnersFromEnrollments} subtitle="Counted from enrollments" icon={UserPlus} theme="purple" />
          <StatCard title="Courses" value={overview.totalCourses ?? courses.length} icon={BookOpen} theme="amber" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card theme="blue">
            <h4 className="font-semibold mb-2">Recent Enrollments</h4>
            {preview(enrollments).length === 0 ? <div className="text-sm text-gray-500">No recent enrollments</div> : (
              <ul className="text-sm space-y-2">
                {preview(enrollments).map((e, i) => (
                  <li key={e._id ?? `${e.studentEmail ?? e.student?.email}-${i}`} className="flex justify-between">
                    <span>{e.studentName || e.student?.name || e.studentEmail}</span>
                    <span className="text-gray-400">{(e.courseTitle || e.course?.title)?.slice(0, 30)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card theme="teal">
            <h4 className="font-semibold mb-2">Recent Payments</h4>
            {preview(payments).length === 0 ? <div className="text-sm text-gray-500">No recent payments</div> : (
              <ul className="text-sm space-y-2">
                {preview(payments).map((p, i) => (
                  <li key={p._id ?? `${p.studentName ?? p.student?.name ?? i}`} className="flex justify-between">
                    <span>{p.studentName || p.student?.name}</span>
                    <span className="text-gray-400">{p.amount ?? p.price ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card theme="purple">
            <h4 className="font-semibold mb-2">Recent Certificates</h4>
            {preview(certificates).length === 0 ? <div className="text-sm text-gray-500">No certificates</div> : (
              <ul className="text-sm space-y-2">
                {preview(certificates).map((c, i) => (
                  <li key={c._id ?? `${c.userName ?? c.user?.name ?? i}`} className="flex justify-between">
                    <span>{c.userName || c.user?.name}</span>
                    <span className="text-gray-400">{c.courseTitle || c.course?.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="bg-gradient-to-r from-white/80 to-white/60 rounded-2xl p-4 shadow-inner">
          <h4 className="font-semibold mb-3">Quick Links & Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-white/90 rounded-xl border">
              <div className="text-gray-500">Active Enrollments</div>
              <div className="font-bold">{overview.activeEnrollments ?? enrollments.length}</div>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border">
              <div className="text-gray-500">Avg Attendance</div>
              <div className="font-bold">{overview.avgAttendance ?? "—"}</div>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border">
              <div className="text-gray-500">Assignments</div>
              <div className="font-bold">{overview.totalAssignments ?? assignments.length}</div>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border">
              <div className="text-gray-500">Certificates</div>
              <div className="font-bold">{overview.totalCertificates ?? certificates.length}</div>
            </div>
          </div>
        </div>

        <MultiSeriesChart months={6} />
      </div>
    );
  };

  /* -------------------------
     Students tab
     ------------------------- */
  const StudentsTab = () => {
    const [query, setQuery] = useState("");

    const students = useMemo(
      () =>
        (users || []).filter((u) => {
          const role = (u.role || "").toString().toLowerCase();
          return !role || role === "student";
        }),
      [users]
    );

    const filtered = students.filter((u) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
    });

    useEffect(() => {
      if (selectAllStudents) {
        const allIds = new Set(students.map((u) => u._id ?? u.id ?? u.email));
        setSelectedStudents(allIds);
      }
    }, [students, selectAllStudents]);

    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Students ({students.length})</h3>
          <div className="flex items-center gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" className="px-3 py-1 border rounded-lg text-sm" />
            <button onClick={() => { setQuery(""); fetchAllData(); }} className="px-3 py-1 bg-gray-200 rounded text-sm">Refresh</button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={selectAllStudents} onChange={() => toggleSelectAll(students)} />
            <span className="text-sm">Select all</span>
          </label>

          <div className="ml-auto flex gap-2">
            <button onClick={exportSelectedAsCSV} className="px-3 py-1 bg-blue-700 text-white rounded text-sm">Export CSV</button>
            <button onClick={bulkDeleteSelected} disabled={selectedStudents.size === 0} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete Selected</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500">No students found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((u, idx) => {
              const id = u._id ?? u.id ?? `stu-${idx}`;

              const enrollCount = (enrollments || []).filter((e) => {
                const sid = pick(e, ["studentId", "student._id", "student.id", "userId", "user._id", "studentEmail", "userEmail"]);
                const matchKey = u._id || u.id || u.email;
                if (!sid) return false;
                return String(sid) === String(matchKey) || String(sid) === String(u.email);
              }).length;

              const checked = selectedStudents.has(u._id ?? u.id ?? u.email);

              return (
                <div key={id} className="flex items-center gap-4 border rounded-lg p-3">
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={checked} onChange={() => toggleSelectStudent(u._id ?? u.id ?? u.email)} />
                  </label>

                  <img src={u.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"} alt={u.name || u.email} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="font-medium">{u.name || u.email}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    <div className="text-xs text-gray-400">Enrolled in {enrollCount} course{enrollCount !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStudentModal(u)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">View</button>
                    <select value={u.role || "student"} onChange={(e) => updateUserRole(u._id, e.target.value)} className="px-2 py-1 border rounded-lg">
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button disabled={isProcessing(u._id)} onClick={() => deleteUser(u._id)} className="px-2 py-2 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <StudentDetailsModal student={studentModal} onClose={() => setStudentModal(null)} enrollments={enrollments} />
      </Card>
    );
  };

  /* -------------------------
     Other tabs (Courses, Enrollments, Attendance, Payments, Certificates, Settings)
     ------------------------- */
  const CoursesTab = () => {
    // normalize possible response shapes and ensure we have a simple array
    const list = normalizeList(courses.length ? courses : (courses?.courses ?? courses?.data ?? courses)) || [];

    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Courses ({list.length})</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchAllData()} className="px-3 py-1 bg-gray-200 rounded text-sm">Refresh</button>
            <button
              disabled={isProcessing("sync-coursera")}
              onClick={handleSyncCoursera}
              className="px-3 py-1 bg-blue-700 text-white rounded text-sm"
              title="Fetch & save Coursera courses"
            >
              {isProcessing("sync-coursera") ? "Syncing…" : "Sync Coursera"}
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-gray-500">No courses yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((c, idx) => (
              <div key={c._id ?? c.id ?? `course-${idx}`} className="flex items-center gap-4 border rounded-lg p-3">
                <div className="w-28 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={c.image || c.thumbnail || c.photoUrl || DEFAULT_PLACEHOLDER} alt={c.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-500">
                    {(c.subtitle || c.description || "").slice(0, 120)} { (c.description && c.description.length > 120) ? "…" : "" }
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Category: {c.category || c.level || "—"}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-semibold">${typeof c.price !== "undefined" ? c.price : 0}</div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/courses/${c._id ?? c.id}`)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">View</button>
                    {canEditCourse(c) && (
                      <button onClick={() => setEditingCourse(c)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CourseFormModal course={editingCourse} onClose={() => setEditingCourse(null)} onSave={saveCourse} canEditInstructorList={instructors} />
      </Card>
    );
  };

  const EnrollmentsTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Enrollments ({enrollments.length})</h3>
        <div className="text-sm text-gray-500">Manage enrolled students</div>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-gray-500">No enrollments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">Full name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((en, idx) => {
                const fullName =
                  pick(en, ["studentName", "student.name", "student.fullName", "user.name", "name"]) ||
                  en.studentEmail ||
                  en.email ||
                  `Student #${idx + 1}`;

                const email =
                  pick(en, ["student.email", "studentEmail", "user.email", "email"]) ||
                  "—";

                const courseTitle =
                  pick(en, ["courseTitle", "course.title", "title"]) ||
                  "—";

                const instructorName =
                  pick(en, ["instructorName", "course.instructor.name", "course.teacherName", "instructor.name", "teacherName"]) ||
                  "—";

                const date = formatDate(pick(en, ["createdAt", "enrolledAt", "date"]));

                const paymentStatusRaw =
                  pick(en, ["paymentStatus", "status", "payment.status", "transaction.status"]) ||
                  (pick(en, ["payment", "transaction"]) ? "completed" : undefined);

                let paymentStatus = "Unknown";
                if (paymentStatusRaw) {
                  const ps = String(paymentStatusRaw).toLowerCase();
                  if (["paid", "completed", "success"].some((s) => ps.includes(s))) paymentStatus = "Paid";
                  else if (["pending", "unpaid", "processing"].some((s) => ps.includes(s))) paymentStatus = "Pending";
                  else if (["refunded", "failed", "cancelled", "canceled"].some((s) => ps.includes(s))) paymentStatus = "Refunded/Failed";
                  else paymentStatus = String(paymentStatusRaw);
                } else {
                  const paidFlag = pick(en, ["paid", "isPaid", "payment?.paid"]);
                  paymentStatus = paidFlag ? "Paid" : "Pending";
                }

                const id = en._id ?? en.id ?? en.enrollmentId ?? `en-${idx}`;

                return (
                  <tr key={id} className="border-t">
                    <td className="p-2">{fullName}</td>
                    <td>{email}</td>
                    <td>{courseTitle}</td>
                    <td>{instructorName}</td>
                    <td>{date}</td>
                    <td>{paymentStatus}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          disabled={isProcessing(id)}
                          onClick={() => unenrollStudent(id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                        >
                          Unenroll
                        </button>

                        {pick(en, ["payment", "transaction", "paymentId", "transactionId"]) && (
                          <button
                            onClick={() => {
                              const payId = pick(en, ["payment._id", "payment.id", "transaction._id", "transaction.id", "paymentId", "transactionId"]);
                              if (payId) navigate(`/admin/payments/${payId}`);
                            }}
                            className="px-2 py-1 bg-gray-200 rounded text-xs"
                          >
                            View Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const AttendanceTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Attendance Records ({attendance.length})</h3>
      {attendance.length === 0 ? (
        <p className="text-gray-500">No attendance records yet.</p>
      ) : (
        attendance.map((a) => (
          <div key={a._id ?? `${a.courseId ?? "c"}-${a.date ?? "d"}`} className="border p-3 rounded-lg bg-white/95 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">{a.courseTitle || a.course?.title}</div>
                <div className="text-xs text-gray-500">{formatDate(a.date)}</div>
              </div>
              <div className="text-sm text-gray-500">Marked by {a.markedBy || a.teacherName}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(a.records || a.attendees || []).map((r, j) => (
                <div key={r.studentId ?? `${r.studentEmail ?? r.student?.email ?? j}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm">{r.studentName}</div>
                  <div className="flex gap-2 items-center">
                    {r.present ? <Check className="text-green-600" /> : <XCircle className="text-red-600" />}
                    <button disabled={isProcessing(`${a.courseId}-${r.studentId}-${a.date}`)} onClick={() => markAttendance(a.courseId || a.course?._id, a.date, r.studentId, !r.present)} className="text-xs text-blue-600">Toggle</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const PaymentsTab = () => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Payments ({payments.length})</h3>
      {payments.length === 0 ? (
        <p className="text-gray-500">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, k) => (
                <tr key={p._id ?? `pay-${k}`} className="border-t">
                  <td className="p-2">{p.studentName || p.student?.name}</td>
                  <td>{p.courseTitle || p.course?.title}</td>
                  <td>{p.amount ?? p.price ?? 0}</td>
                  <td>{formatDate(p.date || p.createdAt)}</td>
                  <td>{p.status || "completed"}</td>
                  <td className="p-2 flex gap-2">
                    <button disabled={isProcessing(p._id)} onClick={() => approvePayout(p._id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                    <button disabled={isProcessing(p._id)} onClick={() => refundPayment(p._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Refund</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const CertificatesTab = () => (
    <div className="space-y-6">
      <Card>
        <CertificateGenerator users={users} courses={courses} onGenerate={generateCertificate} />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-3">Certificates ({certificates.length})</h3>
        {certificates.length === 0 ? (
          <p className="text-gray-500">No certificates yet.</p>
        ) : (
          <div className="space-y-3">
            {certificates.map((c, m) => (
              <div key={c._id ?? `cert-${m}`} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                <div>
                  <div className="font-medium">{c.userName || c.user?.name}</div>
                  <div className="text-xs text-gray-500">{c.courseTitle || c.course?.title} • Issued {formatDate(c.issuedAt || c.createdAt)}</div>
                </div>
                <div className="flex gap-2">
                  <a href={c.url || c.certificateUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">View</a>
                  <button disabled={isProcessing(c._id)} onClick={() => revokeCertificateLocal(c._id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const SettingsTab = () => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
      <p className="text-sm text-gray-600">Add toggles for registration, email config, featured courses, site branding, etc.</p>
    </Card>
  );

  /* -------------------------
     Render
     ------------------------- */
  if (loading) return <div className="p-8">Loading admin data…</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-blue-900" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-blue-900 cursor-pointer" onClick={() => navigate("/")}>SkillForge</h1>
          </div>

          <div className="text-sm text-gray-500 hidden sm:block">Admin Panel</div>
        </header>

        <main className="p-6">
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="space-y-6">
            {activeTab === "Overview" && <OverviewTab />}
            {activeTab === "Instructors" && (
              <section className="grid md:grid-cols-2 gap-6">
                <div><InstructorForm initial={editingInstructor} onSave={saveInstructor} onCancel={() => setEditingInstructor(null)} /></div>
                <div>
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Instructors ({instructors.length})</h3>
                      <div className="text-sm text-gray-500">Manage instructors</div>
                    </div>

                    {instructors.length === 0 ? (
                      <p className="text-gray-500">No instructors yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {instructors.map((inst, idx) => (
                          <div key={inst._id ?? `inst-${idx}`} className="flex items-center gap-4 border rounded-lg p-3">
                            <img src={inst.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"} alt={inst.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="font-medium">{inst.name}</div>
                              <div className="text-xs text-gray-500">{inst.email}</div>
                              <div className="text-xs text-gray-400 line-clamp-2">{inst.bio}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editInstructor(inst)} className="px-2 py-2 bg-gray-100 rounded hover:bg-gray-200" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button disabled={isProcessing(inst._id)} onClick={() => deleteInstructor(inst._id)} className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-500" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </section>
            )}
            {activeTab === "Courses" && <CoursesTab />}
            {activeTab === "Enrollments" && <EnrollmentsTab />}
            {activeTab === "Attendance" && <AttendanceTab />}
            {activeTab === "Students" && <StudentsTab />}
            {activeTab === "Payments" && <PaymentsTab />}
            {activeTab === "Certificates" && <CertificatesTab />}
            {activeTab === "Settings" && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------
   StudentDetailsModal (placed at bottom to avoid hoisting-coupling)
   ------------------------- */
function StudentDetailsModal({ student, onClose, enrollments }) {
  if (!student) return null;
  const studentEnrolls = (enrollments || []).filter((e) => {
    const sid = e.studentId ?? pick(e, ["student._id", "student.id", "studentId"]);
    const matchKey = student._id || student.id || student.email;
    return String(sid) === String(matchKey) || String(sid) === String(student.email);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-lg font-semibold">{student.name || student.email}</h4>
          <button onClick={onClose} className="text-gray-500"><X /></button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="text-sm text-gray-600">Email: {student.email}</div>
          <div className="text-sm text-gray-600">Role: {student.role || "student"}</div>
          <div className="text-sm text-gray-600">Enrolled courses: {studentEnrolls.length}</div>
          <div>
            <h5 className="font-medium mt-2">Recent enrollments</h5>
            {studentEnrolls.length === 0 ? (
              <div className="text-sm text-gray-500">No enrollments</div>
            ) : (
              <ul className="text-sm space-y-1">
                {studentEnrolls.slice(0, 5).map((e, i) => (
                  <li key={e._id ?? i} className="flex justify-between">
                    <span>{e.courseTitle || e.course?.title || "Untitled course"}</span>
                    <span className="text-gray-400">{formatDate(e.createdAt || e.enrolledAt || Date.now())}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}