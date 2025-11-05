import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  GraduationCap,
  User,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 md:px-10">
        {/* Logo left */}
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-semibold text-gray-800">SkillForge</span>
        </Link>

        {/* Right side: mobile hamburger (right), desktop profile */}
        <div className="flex items-center space-x-3">
          {/* Mobile: hamburger on the right */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-blue-600" />
          </button>

          {/* Desktop: profile dropdown (hidden on mobile) */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-800 font-medium">{user?.name || "User"}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <button
                  onClick={handleProfile}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-600" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
