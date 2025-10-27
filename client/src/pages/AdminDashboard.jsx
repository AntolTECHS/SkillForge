// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
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

function InstructorForm({ initial = null, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    image: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        email: initial.email || "",
        password: "",
        bio: initial.bio || "",
        image: initial.image || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        bio: "",
        image: "",
      });
    }
  }, [initial]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{initial ? "Edit Instructor" : "Add Instructor"}</h3>
        {initial && (
          <button onClick={onCancel} className="text-sm text-gray-500">
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required className="w-full px-3 py-2 border rounded" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full px-3 py-2 border rounded" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={initial ? "Leave blank to keep password" : "Password"} className="w-full px-3 py-2 border rounded" />
        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full px-3 py-2 border rounded" />
        <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" placeholder="Short bio" className="w-full px-3 py-2 border rounded" />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
            {initial ? "Save" : "Add Instructor"}
          </button>
          <button type="button" onClick={() => setForm({ name: "", email: "", password: "", bio: "", image: "" })} className="px-4 py-2 border rounded">
            Clear
          </button>
        </div>
      </form>
    </div>
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
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Generate Certificate</h3>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select name="userId" required value={form.userId} onChange={handleChange} className="px-3 py-2 border rounded">
          <option value="">Select student</option>
          {users.map((u) => (
            <option key={u._id ?? `${u.email ?? u.id}`} value={u._id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
        <select name="courseId" required value={form.courseId} onChange={handleChange} className="px-3 py-2 border rounded">
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c._id ?? `${c.title ?? c.id}`} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
        <input name="grade" placeholder="Grade (optional)" value={form.grade} onChange={handleChange} className="px-3 py-2 border rounded" />
        <div className="sm:col-span-3">
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
            Generate Certificate
          </button>
        </div>
      </form>
    </div>
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

  const navigate = useNavigate();

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
        fetchResource("/admin/courses", "/courses", []),
        fetchResource("/admin/enrollments", "/enrollments", []),
        fetchResource("/admin/attendance", "/attendance", []),
        fetchResource("/admin/assignments", "/assignments", []),
        fetchResource("/admin/payments", "/payments", []),
        fetchResource("/admin/certificates", "/certificates", []),
        fetchResource("/admin/users", "/users", []),
      ]);

      setOverview(overviewData || {});
      setInstructors(instructorsData?.instructors ?? instructorsData ?? []);
      setCourses(coursesData?.courses ?? coursesData ?? []);
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data ?? []);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : attendanceData?.data ?? []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.data ?? []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData?.data ?? []);
      setCertificates(Array.isArray(certificatesData) ? certificatesData : certificatesData?.data ?? []);
      setUsers(usersData?.users ?? usersData ?? []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const saveInstructor = useCallback(
    async (form) => {
      try {
        if (editingInstructor && editingInstructor._id) {
          await axios.put(`/admin/instructors/${editingInstructor._id}`, form).catch(() =>
            axios.put(`/instructors/${editingInstructor._id}`, form)
          );
          setEditingInstructor(null);
        } else {
          await axios.post("/admin/instructors", form).catch(() => axios.post("/instructors", form));
        }
        await fetchAllData();
        setActiveTab("Instructors");
      } catch (err) {
        console.error(err);
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
      try {
        await axios.delete(`/admin/instructors/${id}`).catch(() => axios.delete(`/instructors/${id}`));
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete instructor");
      }
    },
    [fetchAllData]
  );

  const unenrollStudent = useCallback(
    async (enrollmentId) => {
      if (!confirm("Unenroll this student?")) return;
      try {
        await axios.delete(`/admin/enrollments/${enrollmentId}`).catch(() => axios.delete(`/enrollments/${enrollmentId}`));
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to unenroll student");
      }
    },
    [fetchAllData]
  );

  const markAttendance = useCallback(
    async (courseId, date, studentId, present = true) => {
      try {
        await axios.post("/instructor/attendance", { courseId, date, studentId, present }).catch(() =>
          axios.post("/admin/attendance", { courseId, date, studentId, present })
        );
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to mark attendance");
      }
    },
    [fetchAllData]
  );

  const gradeSubmission = useCallback(
    async (submissionId, grade) => {
      try {
        await axios.post(`/admin/assignments/${submissionId}/grade`, { grade });
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to grade");
      }
    },
    [fetchAllData]
  );

  const approvePayout = useCallback(
    async (paymentId) => {
      if (!confirm("Approve payout to instructor?")) return;
      try {
        await axios.post(`/admin/payments/${paymentId}/approve`);
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to approve payout");
      }
    },
    [fetchAllData]
  );

  const refundPayment = useCallback(
    async (paymentId) => {
      if (!confirm("Refund this payment?")) return;
      try {
        await axios.post(`/admin/payments/${paymentId}/refund`);
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to refund");
      }
    },
    [fetchAllData]
  );

  const generateCertificate = useCallback(
    async ({ userId, courseId, grade }) => {
      if (!userId || !courseId) {
        alert("student and course required");
        return;
      }
      try {
        await axios.post("/admin/certificates/generate", { userId, courseId, grade }).catch(() =>
          axios.post("/certificates/generate", { userId, courseId, grade })
        );
        await fetchAllData();
        alert("Certificate generation requested.");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to generate certificate");
      }
    },
    [fetchAllData]
  );

  const revokeCertificate = useCallback(
    async (certId) => {
      if (!confirm("Revoke this certificate?")) return;
      try {
        await axios.delete(`/admin/certificates/${certId}`).catch(() => axios.delete(`/certificates/${certId}`));
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to revoke certificate");
      }
    },
    [fetchAllData]
  );

  const updateUserRole = useCallback(
    async (id, role) => {
      try {
        await axios.put(`/admin/users/${id}`, { role }).catch(() => axios.put(`/users/${id}`, { role }));
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to update user role");
      }
    },
    [fetchAllData]
  );

  const deleteUser = useCallback(
    async (id) => {
      if (!confirm("Delete this user?")) return;
      try {
        await axios.delete(`/admin/users/${id}`).catch(() => axios.delete(`/users/${id}`));
        await fetchAllData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete user");
      }
    },
    [fetchAllData]
  );

  const Sidebar = () => (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-blue-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-700">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" />
          SkillForge Admin
        </h2>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-6 space-y-1">
        {NAV_ITEMS.map(({ key, Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-blue-800 transition ${
              activeTab === key ? "bg-blue-800 font-semibold" : ""
            }`}
          >
            <Icon className="w-5 h-5" />
            {key}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
    </aside>
  );

  const OverviewTab = () => {
    const preview = (items) => (Array.isArray(items) ? items.slice(0, 3) : []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overview</h2>
          <div className="flex gap-2">
            <button onClick={fetchAllData} className="px-3 py-1 bg-gray-200 rounded text-sm">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Total Learners</div>
            <div className="text-2xl font-bold">{overview.totalUsers ?? overview.users ?? users.length}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Instructors</div>
            <div className="text-2xl font-bold">{overview.totalInstructors ?? instructors.length}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Courses</div>
            <div className="text-2xl font-bold">{overview.totalCourses ?? courses.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Recent Enrollments</h4>
            {preview(enrollments).length === 0 ? <div className="text-sm text-gray-500">No recent enrollments</div> : (
              <ul className="text-sm space-y-2">
                {preview(enrollments).map((e, i) => (
                  <li key={e._id ?? `${e.studentEmail ?? e.student?.email}-${i}`} className="flex justify-between">
                    <span>{e.studentName || e.student?.name || e.studentEmail}</span>
                    <span className="text-gray-400">{(e.courseTitle || e.course?.title)?.slice(0, 20)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Recent Payments</h4>
            {preview(payments).length === 0 ? <div className="text-sm text-gray-500">No recent payments</div> : (
              <ul className="text-sm space-y-2">
                {preview(payments).map((p, i) => (
                  <li key={p._id ?? `${p.studentName ?? p.student?.name ?? i}`} className="flex justify-between">
                    <span>{p.studentName || p.student?.name}</span>
                    <span className="text-gray-400">${p.amount ?? p.price ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
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
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-3">Quick Links & Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 border rounded">
              <div className="text-gray-500">Active Enrollments</div>
              <div className="font-bold">{overview.activeEnrollments ?? enrollments.length}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-gray-500">Avg Attendance</div>
              <div className="font-bold">{overview.avgAttendance ?? "—"}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-gray-500">Assignments</div>
              <div className="font-bold">{overview.totalAssignments ?? assignments.length}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-gray-500">Certificates</div>
              <div className="font-bold">{overview.totalCertificates ?? certificates.length}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InstructorsTab = () => (
    <section className="grid md:grid-cols-2 gap-6">
      <div>
        <InstructorForm
          initial={editingInstructor}
          onSave={saveInstructor}
          onCancel={() => setEditingInstructor(null)}
        />
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Instructors ({instructors.length})</h3>
        {instructors.length === 0 ? (
          <p className="text-gray-500">No instructors yet.</p>
        ) : (
          <div className="space-y-3">
            {instructors.map((inst, idx) => (
              <div key={inst._id ?? `inst-${idx}`} className="flex items-center gap-4 border rounded p-3">
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
                  <button onClick={() => deleteInstructor(inst._id)} className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const CoursesTab = () => (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Courses ({courses.length})</h3>
        <div className="text-sm text-gray-500">Admin can only view courses</div>
      </div>
      {courses.length === 0 ? (
        <p className="text-gray-500">No courses yet.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c, idx) => (
            <div key={c._id ?? `course-${idx}`} className="flex items-center gap-4 border rounded p-3">
              <img src={c.image || "https://via.placeholder.com/120x80"} alt={c.title} className="w-20 h-12 rounded object-cover" />
              <div className="flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">{c.subtitle} • {c.level}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/courses/${c._id}`)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const EnrollmentsTab = () => (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">Enrollments ({enrollments.length})</h3>
      {enrollments.length === 0 ? (
        <p className="text-gray-500">No enrollments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">Student</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((en) => (
                <tr key={en._id ?? `en-${en.courseTitle ?? en.studentEmail ?? Math.random()}`} className="border-t">
                  <td className="p-2">{en.studentName || en.student?.name || en.studentEmail}</td>
                  <td>{en.courseTitle || en.course?.title}</td>
                  <td>{en.instructorName || en.course?.instructor?.name}</td>
                  <td>{new Date(en.createdAt || en.enrolledAt || Date.now()).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button onClick={() => unenrollStudent(en._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Unenroll</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const AttendanceTab = () => (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h3 className="font-semibold">Attendance Records ({attendance.length})</h3>
      {attendance.length === 0 ? (
        <p className="text-gray-500">No attendance records yet.</p>
      ) : (
        attendance.map((a) => (
          <div key={a._id ?? `${a.courseId ?? "c"}-${a.date ?? "d"}`} className="border p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">{a.courseTitle || a.course?.title}</div>
                <div className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-gray-500">Marked by {a.markedBy || a.teacherName}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(a.records || a.attendees || []).map((r, j) => (
                <div key={r.studentId ?? `${r.studentEmail ?? r.student?.email ?? j}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-sm">{r.studentName}</div>
                  <div className="flex gap-2">
                    {r.present ? <Check className="text-green-600" /> : <XCircle className="text-red-600" />}
                    <button onClick={() => markAttendance(a.courseId || a.course?._id, a.date, r.studentId, !r.present)} className="text-xs text-blue-600">
                      Toggle
                    </button>
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
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">Assignments ({assignments.length})</h3>
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((asg) => (
            <div key={asg._id ?? `${asg.title ?? Math.random()}`} className="border p-3 rounded flex items-start justify-between">
              <div>
                <div className="font-medium">{asg.title}</div>
                <div className="text-xs text-gray-500">{asg.courseTitle || asg.course?.title} • Due {new Date(asg.dueDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/admin/assignments/${asg._id}`)} className="px-3 py-1 bg-blue-700 text-white rounded text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PaymentsTab = () => (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">Payments ({payments.length})</h3>
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
                  <td>${p.amount ?? p.price ?? 0}</td>
                  <td>{new Date(p.date || p.createdAt).toLocaleDateString()}</td>
                  <td>{p.status || "completed"}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => approvePayout(p._id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                    <button onClick={() => refundPayment(p._id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Refund</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const CertificatesTab = () => (
    <div className="space-y-6">
      <CertificateGenerator users={users} courses={courses} onGenerate={generateCertificate} />

      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-3">Certificates ({certificates.length})</h3>
        {certificates.length === 0 ? (
          <p className="text-gray-500">No certificates yet.</p>
        ) : (
          <div className="space-y-3">
            {certificates.map((c, m) => (
              <div key={c._id ?? `cert-${m}`} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{c.userName || c.user?.name}</div>
                  <div className="text-xs text-gray-500">{c.courseTitle || c.course?.title} • Issued {new Date(c.issuedAt || c.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <a href={c.url || c.certificateUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded text-sm">View</a>
                  <button onClick={() => revokeCertificate(c._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">Users ({users.length})</h3>
      {users.length === 0 ? (
        <p className="text-gray-500">No users.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u, n) => (
            <div key={u._id ?? `user-${n}`} className="flex items-center gap-4 border rounded p-3">
              <img src={u.image || "https://cdn-icons-png.flaticon.com/512/194/194938.png"} alt={u.name || u.email} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={u.role || "student"} onChange={(e) => updateUserRole(u._id, e.target.value)} className="px-2 py-1 border rounded">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => deleteUser(u._id)} className="px-2 py-2 bg-red-600 text-white rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SettingsTab = () => (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">Platform Settings</h3>
      <p className="text-sm text-gray-600">Add toggles for registration, email config, featured courses, site branding, etc.</p>
    </div>
  );

  if (loading) return <div className="p-8">Loading admin data…</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-blue-900" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-blue-900 cursor-pointer" onClick={() => navigate("/")}>
              SkillForge
            </h1>
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
