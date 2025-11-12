// src/api.js
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token automatically from localStorage
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user")); // user object saved on login
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
