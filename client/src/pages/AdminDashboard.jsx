import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
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
  FileText,
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

const NAV_ITEMS = [
  { key: "Overview", Icon: BarChart2 },
  { key: "Instructors", Icon: UserPlus },
  { key: "Courses", Icon: BookOpen },
  { key: "Enrollments", Icon: Users },
  { key: "Attendance", Icon: CalendarCheck },
  { key: "Assignments", Icon: FileText },
  { key: "Payments", Icon: DollarSign },
  { key: "Certificates", Icon: Award },
  { key: "Users", Icon: Users },
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

function Card({ children, className = "", theme = "blue" }) {
  const cls = colorClasses(theme);
  return (
    <motion.div whileHover={{ scale: 1.01 }} className={`bg-white/95 backdrop-blur-sm ring-1 ring-gray-100 rounded-2xl p-6 shadow-lg ${className}`}>
      {children}
    </motion.div>
  );
}

function InstructorForm({ initial = null, onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "", image: "" });

  useEffect(() => {
    if (initial) {
      setForm({ name: initial.name || "", email: initial.email || "", password: "", bio: initial.bio || "", image: initial.image || "" });
    } else {
      setForm({ name: "", email: "", password: "", bio: "", image: "" });
    }
  }, [initial]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{initial ? "Edit Instructor" : "Add Instructor"}</h3>
        {initial && (
          <button onClick={onCancel} className="text-sm text-gray-500">Cancel</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={initial ? "Leave blank to keep password" : "Password"} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" placeholder="Short bio" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg">{initial ? "Save" : "Add Instructor"}</button>
          <button type="button" onClick={() => setForm({ name: "", email: "", password: "", bio: "", image: "" })} className="px-4 py-2 border rounded-lg">Clear</button>
        </div>
      </form>
    </Card>
  );
}

function CertificateGenerator({ users, courses, onGenerate }) {
  const [form, setForm] = useState({ userId: "", courseId: "", grade: "" });

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onGenerate(form);
    setForm({ userId: "", courseId: "", grade: "" });
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3">Generate Certificate</h3>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select name="userId" required value={form.userId} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Select student</option>
          {users.map((u) => (
            <option key={u._id ?? `${u.email ?? u.id}`} value={u._id}>{u.name || u.email}</option>
          ))}
        </select>
        <select name="courseId" required value={form.courseId} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c._id ?? `${c.title ?? c.id}`} value={c._id}>{c.title}</option>
          ))}
        </select>
        <input name="grade" placeholder="Grade (optional)" value={form.grade} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <div className="sm:col-span-3">
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg">Generate Certificate</button>
        </div>
      </form>
    </Card>
  );
}

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

  const navigate = useNavigate();

  // --- helpers ---
  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d);
    }
  };

  const pick = (obj, paths = []) => {
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
  };

  const normalizeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    // common shapes
    const candidates = [
      data.enrollments,
      data.results,
      data.data,
      data.rows,
      data.items,
      data.documents,
      data.records,
      data.list,
    ];

    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }

    if (data.data && typeof data.data === 'object') {
      const nested = normalizeList(data.data);
      if (nested.length) return nested;
    }

    if (typeof data === 'object') return [data];

    return [];
  };

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
          if (list.length) { setEnrollments(list); return list; }
        } catch (e) {
          // ignore and try next
        }
      }

      const accumulated = [];
      let page = 1;
      const pageSize = 200;
      for (let i = 0; i < 25; i++) {
        try {
          const res = await axios.get(`/admin/enrollments?page=${page}&limit=${pageSize}`).catch(() => axios.get(`/enrollments?page=${page}&limit=${pageSize}`));
          const d = res.data ?? res;
          const list = normalizeList(d);
          if (!list || list.length === 0) break;
          accumulated.push(...list);
          if (list.length < pageSize) break;
          page += 1;
        } catch (e) { break; }
      }

      if (accumulated.length) {
        setEnrollments(accumulated);
        return accumulated;
      }

    } catch (e) {
      console.warn('fetchAllEnrollments failed', e);
    }
    return [];
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await fetchAllData();
    };
    run();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

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
      const [overviewData, instructorsData, coursesData, enrollmentsData, attendanceData, assignmentsData, paymentsData, certificatesData, usersData] = await Promise.all([
        fetchResource("/admin/overview", null, {}),
        fetchResource("/admin/instructors", "/instructors", []),
        fetchResource("/admin/courses", "/courses", []),
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const addProcessing = (id) => setProcessingIds((s) => Array.from(new Set([...s, id])));
  const removeProcessing = (id) => setProcessingIds((s) => s.filter((x) => x !== id));
  const isProcessing = (id) => processingIds.includes(id);

  const saveInstructor = useCallback(async (form) => {
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
  }, [editingInstructor, fetchAllData]);

  const editInstructor = useCallback((inst) => {
    setEditingInstructor(inst);
    setActiveTab("Instructors");
  }, []);

  const deleteInstructor = useCallback(async (id) => {
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
  }, [fetchAllData]);

  const unenrollStudent = useCallback(async (enrollmentId) => {
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
  }, [fetchAllData]);

  const markAttendance = useCallback(async (courseId, date, studentId, present = true) => {
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
  }, [fetchAllData]);

  const gradeSubmission = useCallback(async (submissionId, grade) => {
    addProcessing(submissionId);
    try {
      await axios.post(`/admin/assignments/${submissionId}/grade`, { grade });
      await fetchAllData();
    } catch (err) {
      alert("Failed to grade");
    } finally {
      removeProcessing(submissionId);
    }
  }, [fetchAllData]);

  const approvePayout = useCallback(async (paymentId) => {
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
  }, [fetchAllData]);

  const refundPayment = useCallback(async (paymentId) => {
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
  }, [fetchAllData]);

  const generateCertificate = useCallback(async ({ userId, courseId, grade }) => {
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
  }, [fetchAllData]);

  const revokeCertificate = useCallback(async (certId) => {
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
  }, [fetchAllData]);

  const updateUserRole = useCallback(async (id, role) => {
    addProcessing(id);
    try {
      await axios.put(`/admin/users/${id}`, { role }).catch(() => axios.put(`/users/${id}`, { role }));
      await fetchAllData();
    } catch (err) {
      alert("Failed to update user role");
    } finally {
      removeProcessing(id);
    }
  }, [fetchAllData]);

  const deleteUser = useCallback(async (id) => {
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
  }, [fetchAllData]);

  // --- analytics helpers for per-tab involvement ---
  const formatMonth = (d) => {
    const dt = new Date(d);
    return dt.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  };

  const getLastNMonths = (n = 6) => {
    const res = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      res.push(d);
    }
    return res;
  };

  // compute involvement counts per tab for the last `months` months
  const computeInvolvement = ({ months = 6 } = {}) => {
    const buckets = getLastNMonths(months).map((d) => ({
      monthLabel: formatMonth(d),
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
      const label = formatMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      return buckets.find((b) => b.monthLabel === label) ?? null;
    };

    // helpers to increment by list and date fields
    const bump = (list, datePaths, key) => {
      (list || []).forEach((item) => {
        const date = pick(item, datePaths) || item.createdAt || item.created_at || item.date || item.publishedAt || item.paidAt;
        const b = findBucket(date);
        if (b) b[key] += 1;
      });
    };

    bump(instructors, ["createdAt", "created_at", "date"], 'instructors');
    bump(courses, ["createdAt", "created_at", "publishedAt", "date"], 'courses');
    bump(enrollments, ["createdAt", "enrolledAt", "created_at", "date"], 'enrollments');
    bump(attendance, ["date", "createdAt", "created_at"], 'attendance');
    bump(assignments, ["createdAt", "created_at", "dueDate", "due_date"], 'assignments');
    // payments: count transactions
    (payments || []).forEach((p) => {
      const date = pick(p, ["createdAt", "date", "paidAt", "created_at"]) || p.date;
      const b = findBucket(date);
      if (b) b.payments += 1;
    });
    bump(certificates, ["issuedAt", "createdAt", "created_at"], 'certificates');
    bump(users, ["createdAt", "created_at", "registeredAt", "date"], 'users');

    return buckets;
  };

  const MultiSeriesChart = ({ months = 6 }) => {
    const data = useMemo(() => computeInvolvement({ months }), [enrollments, instructors, courses, attendance, assignments, payments, certificates, users, months]);

    // list of series to draw (ordered)
    const series = [
      { key: 'enrollments', name: 'Enrollments' },
      { key: 'users', name: 'Users' },
      { key: 'instructors', name: 'Instructors' },
      { key: 'courses', name: 'Courses' },
      { key: 'attendance', name: 'Attendance' },
      { key: 'assignments', name: 'Assignments' },
      { key: 'payments', name: 'Payments' },
      { key: 'certificates', name: 'Certificates' },
    ];

    const strokes = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#e11d48'];

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

  const OverviewTab = () => {
    const preview = (items) => (Array.isArray(items) ? items.slice(0, 3) : []);

    const totalLearners = overview.totalUsers ?? overview.users ?? users.length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <div className="flex gap-2">
            <button onClick={fetchAllData} className="px-3 py-1 bg-gray-200 rounded text-sm">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total Learners" value={totalLearners} icon={Users} theme="teal" />
          <StatCard title="Instructors" value={overview.totalInstructors ?? instructors.length} icon={UserPlus} theme="purple" />
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

        {/* Multi-series analytics chart placed at the BOTTOM of the Overview tab */}
        <MultiSeriesChart months={6} />
      </div>
    );
  };

  const InstructorsTab = () => (
    <section className="grid md:grid-cols-2 gap-6">
      <div>
        <InstructorForm initial={editingInstructor} onSave={saveInstructor} onCancel={() => setEditingInstructor(null)} />
      </div>

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
  );

  const CoursesTab = () => (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Courses ({courses.length})</h3>
        <div className="text-sm text-gray-500">Admin can view courses</div>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses yet.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c, idx) => (
            <div key={c._id ?? `course-${idx}`} className="flex items-center gap-4 border rounded-lg p-3">
              <div className="w-28 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={c.image || "https://via.placeholder.com/120x80"} alt={c.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">{c.subtitle} • {c.level}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/courses/${c._id}`)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

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
                  if (["paid", "completed", "success"].some(s => ps.includes(s))) paymentStatus = "Paid";
                  else if (["pending", "unpaid", "processing"].some(s => ps.includes(s))) paymentStatus = "Pending";
                  else if (["refunded", "failed", "cancelled", "canceled"].some(s => ps.includes(s))) paymentStatus = "Refunded/Failed";
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
                <div className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</div>
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

  const AssignmentsTab = () => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Assignments ({assignments.length})</h3>
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((asg) => (
            <div key={asg._id ?? `${asg.title ?? Math.random()}`} className="border p-3 rounded-lg flex items-start justify-between bg-white">
              <div>
                <div className="font-medium">{asg.title}</div>
                <div className="text-xs text-gray-500">{asg.courseTitle || asg.course?.title} • Due {new Date(asg.dueDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/admin/assignments/${asg._id}`)} className="px-3 py-1 bg-blue-700 text-white rounded-lg text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
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
                  <td>{new Date(p.date || p.createdAt).toLocaleDateString()}</td>
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
      <CertificateGenerator users={users} courses={courses} onGenerate={generateCertificate} />

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
                  <div className="text-xs text-gray-500">{c.courseTitle || c.course?.title} • Issued {new Date(c.issuedAt || c.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <a href={c.url || c.certificateUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">View</a>
                  <button disabled={isProcessing(c._id)} onClick={() => revokeCertificate(c._id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const UsersTab = () => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Users ({users.length})</h3>
      {users.length === 0 ? (
        <p className="text-gray-500">No users.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u, n) => (
            <div key={u._id ?? `user-${n}`} className="flex items-center gap-4 border rounded-lg p-3">
              <img src={u.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"} alt={u.name || u.email} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={u.role || "student"} onChange={(e) => updateUserRole(u._id, e.target.value)} className="px-2 py-1 border rounded-lg">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <button disabled={isProcessing(u._id)} onClick={() => deleteUser(u._id)} className="px-2 py-2 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const SettingsTab = () => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
      <p className="text-sm text-gray-600">Add toggles for registration, email config, featured courses, site branding, etc.</p>
    </Card>
  );

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
            {activeTab === "Instructors" && <InstructorsTab />}
            {activeTab === "Courses" && <CoursesTab />}
            {activeTab === "Enrollments" && <EnrollmentsTab />}
            {activeTab === "Attendance" && <AttendanceTab />}
            {activeTab === "Assignments" && <AssignmentsTab />}
            {activeTab === "Payments" && <PaymentsTab />}
            {activeTab === "Certificates" && <CertificatesTab />}
            {activeTab === "Users" && <UsersTab />}
            {activeTab === "Settings" && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
