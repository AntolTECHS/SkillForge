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
  X,
  Bell,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // example notifications — replace with real data/fetch
  const [notifications] = useState([
    { id: 1, title: "New assignment added", time: "2h ago" },
    { id: 2, title: "Course certificate available", time: "1d ago" },
  ]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep navbar height synced for layout spacing
  useEffect(() => {
    const setNavHeight = () => {
      const el = navRef.current;
      if (!el) return;
      const h = el.getBoundingClientRect().height || 56;
      document.documentElement.style.setProperty("--navbar-height", `${Math.ceil(h)}px`);
    };

    setNavHeight();
    window.addEventListener("resize", setNavHeight);
    return () => window.removeEventListener("resize", setNavHeight);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      role="navigation"
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 md:px-10">
        {/* Logo left */}
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="w-7 h-7 text-sky-600" />
          <span className="text-xl font-extrabold text-sky-600">SkillForge</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Notifications (always visible). On mobile profile is hidden so bell sits next to hamburger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((s) => !s)}
              aria-label="Notifications"
              className="p-2 rounded-md hover:bg-gray-100 transition relative"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold text-white bg-sky-600 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold">Notifications</div>
                <div className="max-h-56 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
                        <div className="text-sm text-gray-800">{n.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-3 py-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/student/notifications");
                    }}
                    className="text-sm text-sky-600 hover:underline"
                  >
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: profile dropdown */}
          <div className="hidden lg:block relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-5 h-5 text-sky-600" />
              </div>
              <span className="text-gray-800 font-medium">{user?.name || "User"}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <button
                  onClick={handleProfile}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  <User className="w-4 h-4 mr-2 text-sky-600" />
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

          {/* Mobile: hamburger/close icon — right-most element */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="w-6 h-6 text-sky-600" /> : <Menu className="w-6 h-6 text-sky-600" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
