import { Outlet } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import InstructorSidebar from "./InstructorSidebar";
import Navbar from "../../components/Navbar";

const InstructorLayout = () => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (visible on large or toggled) */}
      <div
        className={`fixed lg:static top-0 left-0 z-40 transform transition-transform duration-300 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        <InstructorSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col w-full">
        <Navbar />
        <main className="flex-1 p-6 mt-16"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
