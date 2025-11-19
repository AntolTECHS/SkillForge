import { Outlet } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import InstructorSidebar from "./InstructorSidebar";
import Navbar from "../../components/Navbar";

const InstructorLayout = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const navbarHeight = 64; // px, same as Navbar height

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <div className="w-full z-50">
        <Navbar />
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <InstructorSidebar
          isSidebarOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          navbarHeight={navbarHeight}
        />

        {/* Main content */}
        <main
          className="flex-1 p-6 overflow-auto mt-16 lg:ml-64"
          style={{
            marginTop: `${navbarHeight}px`, // spacing below navbar
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
