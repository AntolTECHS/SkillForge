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

  // Attach token to axios headers
  const attachTokenToAxios = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, []);

  // Validate session on mount
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

      if (fetchedUser.role === "instructor" && fetchedUser.isFirstLogin) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }
    } catch {
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

    if (localStorage.getItem("token") && !user) {
      validateSession();
    } else {
      setLoading(false);
    }

    return () => axios.interceptors.request.eject(reqInterceptor);
  }, [validateSession, user]);

  // LOGIN
  const login = async (email, password, options = {}) => {
    setAuthenticating(true);
    try {
      if (!email || !password) throw new Error("Email and password are required");

      const payload = { email, password };
      if (options.temp) payload.temp = true; // for temporary password login

      const res = await axios.post("/auth/login", payload);
      const token = res.data.token || res.data.accessToken;
      if (!token) throw new Error("No token returned from login");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      const returnedUser = res.data.user || res.data;
      setUser(returnedUser);
      localStorage.setItem("user", JSON.stringify(returnedUser));

      if (res.data.forcePasswordChange || returnedUser.isFirstLogin) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }

      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Login failed. Please check credentials.";
      throw { response: { data: { message: msg } } };
    } finally {
      setAuthenticating(false);
    }
  };

  // REGISTER (students only)
  const register = async (name, email, password, role = "student") => {
    setAuthenticating(true);
    try {
      if (!name || !email || !password) throw new Error("All fields are required");
      const res = await axios.post("/auth/register", { name, email, password, role });
      const token = res.data.token || res.data.accessToken;
      const returnedUser = res.data.user || res.data;

      if (!token) throw new Error("No token returned from register");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      setUser(returnedUser);
      localStorage.setItem("user", JSON.stringify(returnedUser));

      return res.data;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed. Please try again.";
      throw { response: { data: { message: msg } } };
    } finally {
      setAuthenticating(false);
    }
  };

  // LOGOUT
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

  // REFRESH USER
  const refreshUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      const fetchedUser = res.data?.user || res.data;
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));

      if (fetchedUser.role === "instructor" && fetchedUser.isFirstLogin) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticating,
        isAuthenticated: !!user,
        firstLogin,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
