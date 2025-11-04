// server/routes/adminRoutes.js
import express from "express";
import path from "path";
import * as adminController from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all admin routes
router.use(protect, authorizeRoles("admin"));

/**
 * Instructor management
 */
router.post("/instructors", adminController.addInstructor || ((req,res)=>res.status(501).json({message:'addInstructor not implemented'})));
router.get("/instructors", adminController.getAllInstructors || ((req,res)=>res.status(501).json({message:'getAllInstructors not implemented'})));
router.delete("/instructors/:id", adminController.deleteInstructor || ((req,res)=>res.status(501).json({message:'deleteInstructor not implemented'})));

/**
 * User management
 */
router.get("/users", adminController.getAllUsers || ((req,res)=>res.status(501).json({message:'getAllUsers not implemented'})));
router.delete("/users/:id", adminController.deleteUser || ((req,res)=>res.status(501).json({message:'deleteUser not implemented'})));

/**
 * Dashboard overview (mock or controller-backed)
 */
router.get("/overview", adminController.getOverview || ((req, res) => {
  res.json({
    users: 142,
    instructors: 8,
    courses: 24,
    enrollments: 310,
    revenue: 52750,
  });
}));

/**
 * Courses endpoints (CRUD + sync)
 */
router.get("/courses", adminController.getCourses || ((req, res) => {
  res.json([
    { id: 1, title: "React Mastery", category: "Web Development" },
    { id: 2, title: "Python Fundamentals", category: "Programming" },
  ]);
}));

router.post("/courses", adminController.createCourse || ((req, res) => {
  const body = req.body || {};
  const created = { _id: String(Date.now()), ...body, createdAt: new Date().toISOString() };
  res.status(201).json(created);
}));

router.get("/courses/:id", adminController.getCourseById || ((req, res) => {
  res.json({ _id: req.params.id, title: "Mock Course", description: "This is a mock course." });
}));

// PUT update course - mandatory for frontend's edit flow
router.put("/courses/:id", adminController.updateCourse || ((req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  console.log(`Admin updating course ${id}`, updates);

  const updatedCourse = {
    id,
    _id: id,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return res.status(200).json(updatedCourse);
}));

router.delete("/courses/:id", adminController.deleteCourse || ((req, res) => {
  const { id } = req.params;
  console.log("Mock delete course", id);
  res.json({ message: `Course ${id} deleted` });
}));

// Sync endpoints
router.post("/courses/sync", adminController.syncCourses || ((req,res)=>{ console.log('Mock sync courses'); res.json({message:'Mock sync started'}); }));
router.post("/import-coursera", adminController.syncCourses || ((req,res)=>{ console.log('Mock import'); res.json({message:'Mock import started'}); }));

/**
 * Enrollments
 */
router.get("/enrollments", adminController.getEnrollments || ((req, res) => {
  res.json([
    { id: 1, user: "Alice", course: "React Mastery" },
    { id: 2, user: "Bob", course: "Python Fundamentals" },
  ]);
}));

router.delete("/enrollments/:id", adminController.deleteEnrollment || ((req, res) => {
  const { id } = req.params;
  console.log(`Mock delete enrollment ${id}`);
  res.status(200).json({ message: `Enrollment ${id} deleted successfully` });
}));

/**
 * Attendance, assignments, payments, certificates
 */
router.get("/attendance", adminController.getAttendance || ((req,res)=>res.json([])));
router.get("/assignments", adminController.getAssignments || ((req,res)=>res.json([])));
router.get("/payments", adminController.getPayments || ((req,res)=>res.json([ { id:1, user:'Alice', amount:150, date:'2025-10-20' }, { id:2, user:'Bob', amount:100, date:'2025-10-22' } ])));

router.get("/certificates", adminController.getCertificates || ((req,res)=>res.json([])));

router.post("/payments/:id/approve", adminController.approvePayment || ((req,res)=>{ const {id}=req.params; console.log('Mock approve',id); res.json({message:`Payment ${id} approved`}); }));
router.post("/payments/:id/refund", adminController.refundPayment || ((req,res)=>{ const {id}=req.params; console.log('Mock refund',id); res.json({message:`Payment ${id} refunded`}); }));

router.post("/certificates/generate", adminController.generateCertificate || ((req,res)=>{ const body=req.body||{}; console.log('Mock generate certificate', body); res.json({message:'Certificate generation requested', payload: body}); }));
router.delete("/certificates/:id", adminController.revokeCertificate || ((req,res)=>{ const {id}=req.params; console.log('Mock revoke certificate', id); res.json({message:`Certificate ${id} revoked`}); }));

/**
 * Optional file upload endpoint for image files.
 */
import multer from 'multer';
const uploadDir = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { const unique = Date.now() + '-' + Math.round(Math.random()*1e9); cb(null, unique + '-' + file.originalname); }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  console.log('File uploaded:', req.file.filename);
  return res.json({ url: fileUrl });
});

export default router;