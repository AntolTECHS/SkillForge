// src/api/axios.js
import axios from "axios";

const DEV = import.meta.env.DEV;

// Automatically determine API base URL
const API_BASE_URL = DEV
  ? "http://localhost:5000/api" // local dev server
  : "https://skillforge-75b5.onrender.com/api"; // Render backend

const USE_CREDENTIALS = (import.meta.env?.VITE_API_USE_COOKIES || "true") === "true";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: USE_CREDENTIALS,
});

// Debug: show baseURL in dev
if (DEV) {
  console.info("[axios] baseURL =", axiosInstance.defaults.baseURL, "| withCredentials =", axiosInstance.defaults.withCredentials);
}

// -----------------
// Request interceptor: attach token
// -----------------
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (err) => Promise.reject(err)
);

// -----------------
// Response interceptor: refresh token logic
// -----------------
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  refreshQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    if (originalRequest?._retry) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      let refreshRes;
      try {
        refreshRes = await axios.post(
          `${API_BASE_URL.replace(/\/api$/, "")}/auth/refresh`,
          {},
          { withCredentials: true }
        );
      } catch (cookieErr) {
        const storedRefresh = localStorage.getItem("refreshToken");
        if (storedRefresh) {
          refreshRes = await axios.post(
            `${API_BASE_URL.replace(/\/api$/, "")}/auth/refresh`,
            { refreshToken: storedRefresh }
          );
        } else {
          throw cookieErr;
        }
      }

      const newToken = refreshRes?.data?.token || refreshRes?.data?.accessToken;
      const newUser = refreshRes?.data?.user;

      if (!newToken) throw new Error("No token returned from refresh");

      localStorage.setItem("token", newToken);
      if (newUser) localStorage.setItem("user", JSON.stringify(newUser));

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      processQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      delete axiosInstance.defaults.headers.common["Authorization"];
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Optional response logger for dev
if (DEV) {
  axiosInstance.interceptors.response.use(
    (res) => {
      console.debug("[axios res]", res.status, res.config?.url);
      return res;
    },
    (err) => {
      if (err?.response) console.warn("[axios err]", err.response.status, err.config?.url);
      return Promise.reject(err);
    }
  );
}

export default axiosInstance;
