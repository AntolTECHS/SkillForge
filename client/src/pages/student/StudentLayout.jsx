// src/pages/student/StudentLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useSidebar } from "../../context/SidebarContext";

const StudentLayout = () => {
  const { isSidebarOpen } = useSidebar();

  /**
   * NOTE:
   * - We assume Navbar uses fixed positioning (common pattern).
   * - To avoid content being covered on iPad / md breakpoints we give the main content
   *   responsive top padding that matches the navbar height.
   *
   * If your Navbar component sets a different height, adjust the numbers below:
   *  - If Navbar height is 64px on mobile and 80px on md, use pt-[64px] md:pt-[80px]
   *
   * Tailwind utilities used here:
   *  - pt-16  => 4rem  => 64px
   *  - pt-20  => 5rem  => 80px
   *  - md:pt-24 => 6rem => 96px (if your Navbar is taller on iPad you can increase)
   *
   * I picked responsive values that are safe for most navbars: mobile 64px, md/ipad 80px.
   */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (off-canvas on mobile, fixed on lg+) */}
      <Sidebar />

      {/* Main area (no left margin on small screens; add left margin on lg+) */}
      <div className={`flex flex-col transition-all duration-200 ${isSidebarOpen ? '' : ''} lg:ml-64`}>
        {/* Navbar: ensure it renders with a z-index so it floats above page content.
            If your Navbar component doesn't set z-index or fixed/sticky positioning,
            add those inside Navbar (e.g. 'fixed top-0 left-0 right-0 z-50'). */}
        <Navbar />

        {/*
          Responsive top padding to avoid overlap:
          - small screens: pt-16 (64px)
          - md / iPad: pt-20 (80px)
          - lg and above: pt-20 (80px)
          Adjust these if your Navbar height differs at each breakpoint.
        */}
        <main className="pt-16 md:pt-20 lg:pt-20 p-4 sm:p-6 lg:p-6 w-full">
          {/* inner container keeps content centered and away from edges */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
