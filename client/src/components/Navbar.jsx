import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LogOut,
  User,
  LayoutDashboard,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    console.trace('Navbar rendered');
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
      {/* Main container */}
      <div className="flex justify-between items-center h-16 px-4 sm:px-10 md:px-24 lg:px-32 xl:px-40">

        {/* Left section: Hamburger + Logo */}
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="block lg:hidden focus:outline-none ml-2 sm:ml-0"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-800" />
            ) : (
              <div className="flex flex-col justify-between w-5 h-[14px]">
                <span className="block w-5 h-[3px] bg-gray-800 rounded"></span>
                <span className="block w-5 h-[3px] bg-gray-800 rounded"></span>
                <span className="block w-5 h-[3px] bg-gray-800 rounded"></span>
              </div>
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SkillForge</span>
          </Link>
        </div>

        {/* Right section: Search + Menu */}
        <div className="flex items-center space-x-4">
          {/* Search icon */}
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-gray-100 transition mr-2 sm:mr-0"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Courses
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-inner px-4 sm:px-10 md:px-24 lg:px-32 xl:px-40 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block text-gray-700 hover:text-blue-600 text-sm font-medium"
          >
            Courses
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 text-sm font-medium"
              >
                Dashboard
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-700 hover:text-blue-600 text-sm font-medium"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="block text-gray-700 hover:text-red-600 text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block bg-blue-600 text-white hover:bg-blue-700 text-center py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
