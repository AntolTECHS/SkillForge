// src/api/axios.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // If you use httpOnly refresh cookie, enable this:
  // withCredentials: true,
});

/**
 * Refresh token handling:
 * - When a 401 happens, we attempt to POST /auth/refresh once.
 * - While refreshing, other requests wait in a queue.
 * - On successful refresh, we replay queued requests with new token.
 * - On failure, we clear local session and redirect to /login.
 */
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If no response or not 401, just reject
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop for refresh endpoint itself
    if (originalRequest._retry) {
      // second failure (or coming from refresh) -> logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // mark request as retried
    originalRequest._retry = true;

    // If already refreshing, queue the request and resolve/reject later
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            // attach new token and retry
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    // Start refresh flow
    isRefreshing = true;

    // Use the default axios (no interceptors) to avoid recursion
    return new Promise(async (resolve, reject) => {
      try {
        // If you store a refresh token in localStorage (not recommended),
        // include it in the request body. Better: keep refresh token as httpOnly cookie
        // and call POST /auth/refresh with withCredentials: true.
        const refreshToken = localStorage.getItem("refreshToken");

        // Choose one of the two refresh patterns depending on your backend:
        // Pattern A (refresh token in request body)
        // const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        // Pattern B (refresh token in httpOnly cookie)
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            // If your server sets/reads httpOnly cookie for refresh token:
            withCredentials: true,
          }
        );

        const newToken = refreshRes.data?.token || refreshRes.data?.accessToken;
        const newUser = refreshRes.data?.user;

        if (!newToken) {
          throw new Error("No token returned from refresh");
        }

        // Save and apply the new token
        localStorage.setItem("token", newToken);
        if (newUser) localStorage.setItem("user", JSON.stringify(newUser));

        // update default header for future requests
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(axiosInstance(originalRequest));
      } catch (refreshError) {
        processQueue(refreshError, null);

        // cleanup and force login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken"); // if used
        delete axiosInstance.defaults.headers.common["Authorization"];

        // optional: show a nicer UI instead of redirect in some apps
        window.location.href = "/login";

        reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    });
  }
);

export default axiosInstance;
