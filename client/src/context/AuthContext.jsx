// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../api/axios";

export const AuthContext = createContext(null);

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
  const [firstLogin, setFirstLogin] = useState(localStorage.getItem("firstLogin") === "true");
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  /* =========================
     Attach token to Axios
  ========================== */
  const attachTokenToAxios = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  /* =========================
     Validate Session
  ========================== */
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      attachTokenToAxios();
      const res = await axios.get("/auth/me");
      const fetchedUser = res.data?.user || res.data;

      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));

      if (fetchedUser.role === "instructor" && (fetchedUser.isFirstLogin || fetchedUser.forcePasswordChange)) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }
    } catch (err) {
      console.warn("Session validation failed:", err?.response?.data || err.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("firstLogin");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setFirstLogin(false);
    } finally {
      setLoading(false);
    }
  }, [attachTokenToAxios]);

  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const t = localStorage.getItem("token");
        if (t) config.headers = { ...config.headers, Authorization: `Bearer ${t}` };
        return config;
      },
      (err) => Promise.reject(err)
    );

    const token = localStorage.getItem("token");
    if (token && !user) validateSession();
    else setLoading(false);

    return () => axios.interceptors.request.eject(reqInterceptor);
  }, [validateSession, user]);

  /* =========================
     Login
  ========================== */
  const login = async (email, password) => {
    setAuthenticating(true);
    try {
      const payload = { email: email.trim(), password: password.trim() };
      console.group("[auth.login] Attempt");
      console.log("Login payload:", payload);

      const res = await axios.post("/auth/login", payload);
      console.log("Server response:", res.data);

      const token = res.data?.token;
      const returnedUser = res.data?.user;

      if (!token) throw new Error("No token returned from login");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      setUser(returnedUser);
      localStorage.setItem("user", JSON.stringify(returnedUser));

      if (res.data?.forcePasswordChange) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }

      console.groupEnd();
      return res.data;
    } catch (err) {
      console.group("[auth.login] Error");
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        console.groupEnd();
        throw err.response.data || { message: "Login failed" };
      } else {
        console.error("Error message:", err.message);
        console.groupEnd();
        throw { message: err.message || "Login failed" };
      }
    } finally {
      setAuthenticating(false);
    }
  };

  /* =========================
     Register (students only)
  ========================== */
  const register = async (name, email, password) => {
    setAuthenticating(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), password: password.trim() };
      const res = await axios.post("/auth/register", payload);
      const token = res.data?.token;
      const returnedUser = res.data?.user;

      if (!token) throw new Error("No token returned from register");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      setUser(returnedUser);
      localStorage.setItem("user", JSON.stringify(returnedUser));

      return res.data;
    } catch (err) {
      console.error("[auth.register] error:", err.response?.data || err.message);
      throw err.response?.data || { message: "Registration failed" };
    } finally {
      setAuthenticating(false);
    }
  };

  /* =========================
     Logout
  ========================== */
  const logout = async (callServer = false) => {
    try {
      if (callServer) await axios.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("firstLogin");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setFirstLogin(false);
    }
  };

  /* =========================
     Change Password
  ========================== */
  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      attachTokenToAxios();
      const payload = { newPassword };
      if (currentPassword) payload.currentPassword = currentPassword;

      const res = await axios.post("/auth/change-password", payload);
      return res.data;
    } catch (err) {
      console.error("[auth.changePassword] error:", err.response?.data || err.message);
      throw err.response?.data || { message: "Failed to change password" };
    }
  };

  /* =========================
     Refresh User
  ========================== */
  const refreshUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      const fetchedUser = res.data?.user || res.data;

      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));

      if (fetchedUser.role === "instructor" && (fetchedUser.isFirstLogin || fetchedUser.forcePasswordChange)) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }

      return fetchedUser;
    } catch (err) {
      console.warn("Failed to refresh user:", err?.response?.data || err.message);
      return null;
    }
  };

  const value = {
    user,
    loading,
    authenticating,
    isAuthenticated: !!user,
    firstLogin,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
