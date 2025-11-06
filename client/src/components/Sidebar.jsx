import { NavLink, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { Home, BookOpen, MessageSquare, Award, FileBadge, Users } from "lucide-react";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mainMenu = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/student/dashboard" },
    { name: "Courses", icon: <BookOpen size={20} />, path: "/student/courses" },
    { name: "Chat with AI", icon: <MessageSquare size={20} />, path: "/student/chat" },
    { name: "Community", icon: <Users size={20} />, path: "/student/community" },
    { name: "Certificates", icon: <FileBadge size={20} />, path: "/student/certificates" },
    { name: "XP & Rewards", icon: <Award size={20} />, path: "/student/rewards" },
  ];

  const handleProfileClick = () => {
    closeSidebar();
    navigate("/profile");
  };

  const handleLogoutClick = () => {
    closeSidebar();
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`
          fixed left-0 top-0 z-40
          h-full w-64
          bg-gradient-to-b from-blue-100 via-blue-50 to-white
          text-gray-800 flex flex-col shadow-lg border-r border-blue-200
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Main wrapper — pushes footer to the bottom */}
        <div
          className="flex flex-col justify-between h-full overflow-hidden"
          style={{ paddingTop: "var(--navbar-height, 56px)" }}
        >
          {/* NAVIGATION */}
          <div>
            {/* --- Removed the mobile-only close row so the Navbar toggle (hamburger/X) is the single control --- */}

            {/* nav links area */}
            <nav className="p-4 mt-2 space-y-1 overflow-y-auto">
              {mainMenu.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* FOOTER */}
          <div className="hidden lg:block p-4 border-t border-blue-200 text-xs text-gray-500 text-center">
            © 2025 SkillForge
          </div>

          {/* MOBILE PROFILE + LOGOUT */}
          <div className="lg:hidden border-t border-blue-200 p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold text-blue-800">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500">{user?.email || ""}</div>
            </div>

            <button
              onClick={handleProfileClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm transition"
            >
              Profile
            </button>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={closeSidebar} />
      )}
    </>
  );
};

export default Sidebar;
