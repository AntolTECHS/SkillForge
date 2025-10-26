// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true); // true until we validate session
  const [authenticating, setAuthenticating] = useState(false); // for login/register flows

  // Ensure axios always sends token if present (helps SSR-less apps)
  const attachTokenToAxios = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, []);

  // Validate token with server and refresh local user
  const validateSession = useCallback(async () => {
    setLoading(true);
    attachTokenToAxios();
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/auth/me"); // should return { user }
      const fetchedUser = res.data?.user || res.data;
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));
    } catch (err) {
      // Invalid/expired token -> clear session
      console.warn("Session validation failed:", err?.response?.data || err.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  }, [attachTokenToAxios]);

  useEffect(() => {
    // set axios interceptor to always pick latest token from localStorage (safe across tabs)
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem("token");
      if (t) config.headers = { ...config.headers, Authorization: `Bearer ${t}` };
      return config;
    }, (err) => Promise.reject(err));

    // validate current session on mount
    validateSession();

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
    };
  }, [validateSession]);

  // login
  const login = async (email, password) => {
    setAuthenticating(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      const token = res.data?.token || res.data?.accessToken;
      const returnedUser = res.data?.user || res.data;

      if (!token) throw new Error("No token returned from login");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      // If server returned user object use it, otherwise re-validate
      if (returnedUser && returnedUser.role) {
        setUser(returnedUser);
        localStorage.setItem("user", JSON.stringify(returnedUser));
      } else {
        await validateSession();
      }

      return res.data;
    } finally {
      setAuthenticating(false);
    }
  };

  // register (optional role)
  const register = async (name, email, password, role = "student") => {
    setAuthenticating(true);
    try {
      const res = await axios.post("/auth/register", { name, email, password, role });
      const token = res.data?.token || res.data?.accessToken;
      const returnedUser = res.data?.user || res.data;

      if (!token) throw new Error("No token returned from register");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      if (returnedUser && returnedUser.role) {
        setUser(returnedUser);
        localStorage.setItem("user", JSON.stringify(returnedUser));
      } else {
        await validateSession();
      }

      return res.data;
    } finally {
      setAuthenticating(false);
    }
  };

  const logout = async (callServer = false) => {
    // optionally call backend logout endpoint to clear cookie/session
    try {
      if (callServer) await axios.post("/auth/logout").catch(() => {});
    } catch (err) {
      // ignore server logout errors
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  // helper to refresh user details after profile edits
  const refreshUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      const fetchedUser = res.data?.user || res.data;
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));
      return fetchedUser;
    } catch (err) {
      console.warn("Failed to refresh user:", err);
      return null;
    }
  };

  // convenience flags
  const isAuthenticated = !!user;
  const isAdmin = !!user && (user.role === "admin" || user.isAdmin === true);

  const value = {
    user,
    loading,
    authenticating,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshUser,
    validateSession,
    setUser, // sometimes handy (use carefully)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
