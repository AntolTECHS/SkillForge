// src/components/AuthNavbar.jsx
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const AuthNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm py-3">
      <div className="flex items-center px-4 justify-center lg:justify-start max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="w-7 h-7 text-sky-600" />
          <span className="text-xl font-extrabold text-sky-600">SkillForge</span>
        </Link>
      </div>
    </nav>
  );
};

export default AuthNavbar;
