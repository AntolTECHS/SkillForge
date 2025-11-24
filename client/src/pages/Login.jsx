// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import AuthNavbar from "../components/AuthNavbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, firstLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      setLoading(true);

      const res = await login(email.trim(), password);

      // Redirect to change-password if forced
      if (res.forcePasswordChange || firstLogin) {
        navigate("/change-password", { state: { email: email.trim() } });
        return;
      }

      // Redirect based on role or previous page
      const redirectTo = location.state?.from || null;
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      switch (res.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "instructor":
          navigate("/instructor/dashboard");
          break;
        default:
          navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("[Login] error:", err);
      const msg = err?.message || err?.data?.message || "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-900 to-sky-700 px-4">
      {/* Navbar */}
      <AuthNavbar />

      {/* Content */}
      <div className="pt-32 pb-12 flex justify-center">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-sky-600 p-3 rounded-full">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Welcome Back to SkillForge
          </h2>
          <p className="text-center text-gray-300 mb-8">
            Sign in to continue your learning journey
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 text-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 text-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors font-semibold disabled:bg-sky-400 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-300 mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-sky-400 hover:underline cursor-pointer font-medium"
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
