// src/pages/student/StudentLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useSidebar } from "../../context/SidebarContext";

const StudentLayout = () => {
  const { isSidebarOpen } = useSidebar();

  // Increased offset for proper spacing
  const contentTopPadding = "calc(var(--navbar-height, 56px) + 24px)";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-200 ${
          isSidebarOpen ? "" : ""
        } lg:ml-64`}
      >
        <Navbar />

        <main
          className="p-4 sm:p-6 lg:p-6 w-full h-full"
          style={{ paddingTop: contentTopPadding }}
        >
          {/* Removed max-w-7xl and mx-auto so content spans full width */}
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
