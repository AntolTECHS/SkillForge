// src/pages/student/StudentLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useSidebar } from "../../context/SidebarContext";

const StudentLayout = () => {
  const { isSidebarOpen } = useSidebar();

  // Consistent spacing for all pages
  const contentTopPadding = "calc(var(--navbar-height) + 10px)";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 transition-all duration-200 lg:ml-64">
        <Navbar />

        <main
          className="p-4 sm:p-6 lg:p-6 w-full h-full"
          style={{ paddingTop: contentTopPadding }}
        >
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
