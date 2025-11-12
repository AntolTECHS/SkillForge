import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  ClipboardList,
  Users,
  Settings,
  Home,
} from "lucide-react";

const InstructorSidebar = () => {
  const location = useLocation();

  const tabs = [
    { name: "Dashboard", icon: Home, path: "/instructor/dashboard" },
    { name: "My Courses", icon: BookOpen, path: "/instructor/my-courses" },
    { name: "Create Course", icon: PlusCircle, path: "/instructor/create-course" },
    { name: "Quizzes", icon: ClipboardList, path: "/instructor/quizzes" },
    { name: "Students", icon: Users, path: "/instructor/students" },
    { name: "Settings", icon: Settings, path: "/instructor/settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen hidden lg:flex flex-col pt-20">
      <nav className="flex flex-col gap-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition 
                ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
