import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Home, BookOpen, PlusCircle, Users, Settings } from "lucide-react";

const InstructorSidebar = ({ isSidebarOpen, closeSidebar, navbarHeight = 64 }) => {
  const { user, logout, firstLogin } = useAuth();

  const tabs = [
    { name: "Dashboard", icon: Home, path: "/instructor/dashboard" },
    { name: "My Courses", icon: BookOpen, path: "/instructor/my-courses" },
    !firstLogin && { name: "Create Course", icon: PlusCircle, path: "/instructor/create-course" },
    { name: "Students", icon: Users, path: "/instructor/students" },
    { name: "Settings", icon: Settings, path: "/instructor/settings" },
  ].filter(Boolean);

  const handleLogout = () => {
    logout();
    closeSidebar && closeSidebar();
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 w-64
          bg-gradient-to-b from-blue-100 via-blue-50 to-white
          text-gray-800 flex flex-col shadow-lg border-r border-blue-200
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
        style={{ marginTop: `${navbarHeight}px`, height: `calc(100vh - ${navbarHeight}px)` }}
      >
        {/* Navigation (scrollable) */}
        <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                  } ${index === 0 ? "mt-6" : ""}`
                }
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer (always visible at bottom) */}
        <div className="mt-auto p-4 border-t border-blue-200">
          <div className="text-sm font-semibold text-blue-800">{user?.name || "Instructor"}</div>
          <div className="text-xs text-gray-500 mb-3">{user?.email || ""}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
};

export default InstructorSidebar;
