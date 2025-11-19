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

      if (
        fetchedUser.role === "instructor" &&
        (fetchedUser.isFirstLogin || fetchedUser.forcePasswordChange)
      ) {
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
     Login (after OTP)
  ========================== */
  const login = async (email, password) => {
    setAuthenticating(true);
    try {
      const payload = { email: email.trim(), password: password.trim() };

      const res = await axios.post("/auth/login", payload);

      const token = res.data?.token;
      const returnedUser = res.data?.user;

      if (!token) throw new Error("No token returned from login");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      setUser(returnedUser);
      localStorage.setItem("user", JSON.stringify(returnedUser));

      // FORCE PASSWORD CHANGE HERE
      if (res.data?.forcePasswordChange) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || { message: "Login failed" };
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
     Change Password (FIXED)
  ========================== */
  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      attachTokenToAxios();

      const res = await axios.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      // 🔥 IMPORTANT FIX: stop redirect loop
      setFirstLogin(false);
      localStorage.removeItem("firstLogin");

      // 🔥 Refresh user so backend flags update
      await refreshUser();

      return res.data;
    } catch (err) {
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

      if (
        fetchedUser.role === "instructor" &&
        (fetchedUser.isFirstLogin || fetchedUser.forcePasswordChange)
      ) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }

      return fetchedUser;
    } catch {
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
