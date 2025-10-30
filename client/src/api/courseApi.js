// src/api/courseApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Attach token to all requests if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Fetch courses for the logged-in instructor
export const getInstructorCourses = async () => {
  const res = await API.get("/instructors/my-courses");
  return res.data;
};

// Update a course
export const updateCourse = async (id, payload) => {
  const res = await API.put(`/courses/${id}`, payload);
  return res.data;
};

// Optional: sync Coursera courses
export const syncCourseraCourses = async () => {
  const res = await API.get("/courses/sync/coursera");
  return res.data;
};
