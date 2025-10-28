// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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

  const [firstLogin, setFirstLogin] = useState(() => {
    return localStorage.getItem("firstLogin") === "true";
  });

  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  // ==============================
  // Helper: Attach JWT to Axios
  // ==============================
  const attachTokenToAxios = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  // ==============================
  // Validate session on mount
  // ==============================
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("🔸 No token found — skipping session validation");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🔹 Validating session...");
      attachTokenToAxios();
      const res = await axios.get("/auth/me"); // expects { user }
      const fetchedUser = res.data?.user || res.data;
      console.log("✅ Session valid. User:", fetchedUser);

      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));
    } catch (err) {
      console.warn("❌ Session validation failed:", err?.response?.data || err.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [attachTokenToAxios]);

  // ==============================
  // Run once on app mount
  // ==============================
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const t = localStorage.getItem("token");
        if (t)
          config.headers = { ...config.headers, Authorization: `Bearer ${t}` };
        return config;
      },
      (err) => Promise.reject(err)
    );

    const token = localStorage.getItem("token");

    // ✅ Only run validation if token exists and user not yet set
    if (token && !user) {
      console.log("🟢 Found token, validating session...");
      validateSession();
    } else {
      console.log("🟠 No need to validate — user already set or no token.");
      setLoading(false);
    }

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
    };
  }, [validateSession, user]);

  // ==============================
  // LOGIN HANDLER
  // ==============================
  const login = async (email, password) => {
    console.log("🪵 LOGIN ATTEMPT:", { email, password });
    setAuthenticating(true);

    try {
      const res = await axios.post("/auth/login", { email, password });
      console.log("✅ LOGIN SUCCESS:", res.data);

      const token = res.data?.token || res.data?.accessToken;
      const returnedUser = res.data?.user || res.data;

      if (!token) throw new Error("No token returned from login");

      localStorage.setItem("token", token);
      attachTokenToAxios();

      if (res.data.firstLogin) {
        setFirstLogin(true);
        localStorage.setItem("firstLogin", "true");
      } else {
        setFirstLogin(false);
        localStorage.removeItem("firstLogin");
      }

      if (returnedUser && returnedUser.role) {
        setUser(returnedUser);
        localStorage.setItem("user", JSON.stringify(returnedUser));
      } else {
        await validateSession();
      }

      return res.data;
    } catch (err) {
      console.error("❌ LOGIN FAILED:", err.response?.data || err.message);
      throw err;
    } finally {
      setAuthenticating(false);
    }
  };

  // ==============================
  // REGISTER HANDLER
  // ==============================
  const register = async (name, email, password, role = "student") => {
    console.log("🪵 REGISTER ATTEMPT:", { name, email, role });
    setAuthenticating(true);

    try {
      const res = await axios.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      const token = res.data?.token || res.data?.accessToken;
      const returnedUser = res.data?.user || res.data;

      console.log("✅ REGISTER SUCCESS:", returnedUser);

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
    } catch (err) {
      console.error("❌ REGISTER FAILED:", err.response?.data || err.message);
      throw err;
    } finally {
      setAuthenticating(false);
    }
  };

  // ==============================
  // LOGOUT HANDLER
  // ==============================
  const logout = async (callServer = false) => {
    console.log("🚪 Logging out...");
    try {
      if (callServer) await axios.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("firstLogin");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setFirstLogin(false);
      console.log("✅ Logged out successfully.");
    }
  };

  // ==============================
  // REFRESH USER DETAILS
  // ==============================
  const refreshUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      const fetchedUser = res.data?.user || res.data;
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));
      console.log("🔄 User refreshed:", fetchedUser);
      return fetchedUser;
    } catch (err) {
      console.warn("⚠️ Failed to refresh user:", err);
      return null;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user && (user.role === "admin" || user.isAdmin === true);
  const isInstructor = !!user && user.role === "instructor";

  const value = {
    user,
    loading,
    authenticating,
    isAuthenticated,
    isAdmin,
    isInstructor,
    firstLogin,
    login,
    register,
    logout,
    refreshUser,
    validateSession,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
