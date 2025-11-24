import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm py-3">
      <div className="flex items-center justify-between px-10 lg:px-40">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="w-7 h-7 text-sky-600" />
          <span className="text-xl font-extrabold text-sky-600">SkillForge</span>
        </Link>

        {/* Right: Get Started Button */}
        <Link
          to="/login"
          className="bg-sky-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-sky-700 transition hidden sm:inline-block"
        >
          Get Started →
        </Link>
      </div>
    </nav>
  );
};

export default HomeNavbar;
