// src/api/axios.js
import axios from "axios";

/**
 * Resolve API base robustly from env (allows values like ':5000', '5000', '/api', or full URL)
 */
function resolveApiBase() {
  const raw = (import.meta.env?.VITE_API_BASE_URL || "").toString().trim();

  // default if nothing provided
  if (!raw) return "http://localhost:5000/api";

  // already an absolute URL
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");

  // :5000 or :3000 style -> prepend current hostname and http
  if (/^:\d+/.test(raw)) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${host}${raw.replace(/\/$/, "")}/api`.replace(/\/+$/, "");
  }

  // numeric port only -> host:port
  if (/^\d+$/.test(raw)) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${host}:${raw}/api`.replace(/\/+$/, "");
  }

  // starts with / (e.g. /api) -> use as-is (no trailing slash)
  if (raw.startsWith("/")) return raw.replace(/\/$/, "");

  // otherwise assume host[:port] or path-like -> ensure http:// and /api if needed
  const cleaned = raw.replace(/\/$/, "");
  if (cleaned.includes("/")) return cleaned;
  return `http://${cleaned}/api`;
}

const API_BASE_URL = resolveApiBase();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // If you use httpOnly refresh cookie, set this to true and ensure server CORS allows credentials.
  withCredentials: false,
});

/* ---------------------
   Refresh-token queue logic
   --------------------- */
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

/* Attach token to outgoing requests */
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore getItem errors
      console.warn("axios: failed to read token from localStorage", e);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* Response interceptor handles 401 -> attempt refresh (with queue) */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If no response (network error) or not 401, just forward the error
    if (!error.response || error.response.status !== 401) {
      // helpful logging
      if (error.response) {
        console.error("[API ERROR]", error.response.status, originalRequest?.url, error.response.data);
      } else {
        console.error("[API NETWORK ERROR]", originalRequest?.url, error.message);
      }
      return Promise.reject(error);
    }

    // Avoid retrying refresh endpoint or infinite loops
    if (originalRequest && originalRequest._retry) {
      // second failure: clear session and redirect to login
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
      } catch (e) {}
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // mark as retried
    originalRequest._retry = true;

    // If a refresh is in flight, queue this request
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

    // Start refresh
    isRefreshing = true;

    return new Promise(async (resolve, reject) => {
      try {
        // Option A: refresh token stored in localStorage (less recommended)
        const refreshToken = localStorage.getItem("refreshToken");

        // Option B: refresh via httpOnly cookie (preferred). Choose the one your backend supports.
        // Here we try cookie approach first, falling back to body if you have refresh token in storage.
        let refreshRes;
        try {
          refreshRes = await axios.post(
            `${API_BASE_URL.replace(/\/api$/, "")}/auth/refresh`,
            {},
            { withCredentials: true } // allow httpOnly cookie refresh flow
          );
        } catch (cookieErr) {
          // fallback to body-based refresh (if you store refreshToken in localStorage)
          if (refreshToken) {
            refreshRes = await axios.post(`${API_BASE_URL.replace(/\/api$/, "")}/auth/refresh`, { refreshToken });
          } else {
            throw cookieErr; // nothing to fallback to
          }
        }

        const newToken = refreshRes?.data?.token || refreshRes?.data?.accessToken;
        const newUser = refreshRes?.data?.user;

        if (!newToken) {
          throw new Error("No token returned from refresh");
        }

        // persist new token/user
        localStorage.setItem("token", newToken);
        if (newUser) localStorage.setItem("user", JSON.stringify(newUser));

        // update default header and process queued requests
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        // retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(axiosInstance(originalRequest));
      } catch (refreshError) {
        processQueue(refreshError, null);

        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("refreshToken");
        } catch (e) {}

        delete axiosInstance.defaults.headers.common["Authorization"];

        // optional: redirect to login
        window.location.href = "/login";
        reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    });
  }
);

/* Helpful dev logging — optional, disable in production if noisy */
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // already logged above for network/401; keep minimal console output for other errors
    if (err?.response && err.response.status !== 401) {
      console.error("[API ERROR]", err.response.status, err.config?.url, err.response.data);
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
