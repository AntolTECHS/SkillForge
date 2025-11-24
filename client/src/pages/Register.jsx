// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import AuthNavbar from "../components/AuthNavbar";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password) => {
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /\d/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(password) &&
      upper.test(password) &&
      lower.test(password) &&
      number.test(password) &&
      special.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must include at least 8 characters, one uppercase, one lowercase, one number, and one special character"
      );
      return;
    }

    try {
      setLoading(true);
      const res = await register(name, email, password);
      const createdUser = res?.user || res;

      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      switch (createdUser?.role) {
        case "admin":
          navigate("/admin");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Registration failed. Please try again.";
      setError(message);
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
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Create Your SkillForge Account
          </h2>
          <p className="text-center text-gray-300 mb-8">
            Join SkillForge and start your learning journey today
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 text-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-300 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 text-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-300 transition"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 text-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-300 transition"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 text-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-300 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors font-semibold disabled:bg-sky-400 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-gray-300">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
