// src/api/axios.js
// Robust axios instance for SkillForge frontend
// - Resolves a sensible API base from VITE_API_BASE_URL (supports many formats)
// - Defaults to http://localhost:5000/api when nothing provided
// - Attaches token from localStorage if present
// - Attempts cookie-based refresh first (withCredentials) then body-based refresh
// - Includes helpful debug logs (disable in production)

import axios from "axios";

function resolveApiBase() {
  const raw = (import.meta.env?.VITE_API_BASE_URL || "").toString().trim();

  if (!raw) return "http://localhost:5000/api";

  // Absolute URL
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");

  // :5000 -> host:port style
  if (/^:\d+/.test(raw)) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${host}${raw.replace(/\/$/, "")}/api`.replace(/\/+$/, "");
  }

  // numeric port only
  if (/^\d+$/.test(raw)) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${host}:${raw}/api`.replace(/\/+$/, "");
  }

  // starts with / (like /api)
  if (raw.startsWith("/")) return raw.replace(/\/$/, "");

  // otherwise return as-is (cleaned)
  return raw.replace(/\/$/, "");
}

const API_BASE_URL = resolveApiBase();
const USE_CREDENTIALS = (import.meta.env?.VITE_API_USE_COOKIES || "true") === "true";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // If your backend uses httpOnly cookie refresh flow, set withCredentials true.
  // If you rely on bearer tokens only, this can be false — but leaving true is usually safe.
  withCredentials: USE_CREDENTIALS,
});

// Debug: show baseURL in console (remove or guard this in production)
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info("[axios] baseURL =", axiosInstance.defaults.baseURL, "| withCredentials =", axiosInstance.defaults.withCredentials);
}

/* ---------- request interceptor: attach token (if any) ---------- */
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ---------- refresh logic on 401 with queue ---------- */
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      // network error
      return Promise.reject(error);
    }

    // Only handle 401 here
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // prevent retry loops
    if (originalRequest && originalRequest._retry) {
      // second failure: clear auth and redirect
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
      } catch (e) {}
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
      // First try cookie-based refresh (server should read httpOnly cookie)
      let refreshRes;
      try {
        refreshRes = await axios.post(
          `${API_BASE_URL.replace(/\/api$/, "")}/auth/refresh`,
          {},
          { withCredentials: true }
        );
      } catch (cookieErr) {
        // fallback to body-based refresh if refreshToken is in localStorage
        const storedRefresh = localStorage.getItem("refreshToken");
        if (storedRefresh) {
          refreshRes = await axios.post(`${API_BASE_URL.replace(/\/api$/, "")}/auth/refresh`, { refreshToken: storedRefresh });
        } else {
          throw cookieErr;
        }
      }

      const newToken = refreshRes?.data?.token || refreshRes?.data?.accessToken;
      const newUser = refreshRes?.data?.user;

      if (!newToken) throw new Error("No token returned from refresh");

      // persist
      localStorage.setItem("token", newToken);
      if (newUser) localStorage.setItem("user", JSON.stringify(newUser));

      // update axios header
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      processQueue(null, newToken);

      // retry original request
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
      } catch (e) {}
      delete axiosInstance.defaults.headers.common["Authorization"];
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/* optional: lightweight response logger for dev */
if (import.meta.env.DEV) {
  axiosInstance.interceptors.response.use(
    (res) => {
      // eslint-disable-next-line no-console
      console.debug("[axios res]", res.status, res.config?.url);
      return res;
    },
    (err) => {
      // eslint-disable-next-line no-console
      if (err?.response) console.warn("[axios err]", err.response.status, err.config?.url);
      return Promise.reject(err);
    }
  );
}

export default axiosInstance;
