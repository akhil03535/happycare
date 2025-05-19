import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, User, Settings, LogOut, Sun, Moon, FileText, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex`}>
      {/* Sidebar */}
      <aside className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg fixed h-full`}>
        <div className="p-4">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-600'}`}>
            Happycare
          </h1>
        </div>
        <nav className="mt-8">
          <Link
            to="/home"
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === '/home' 
                ? darkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Home
          </Link>
          <Link
            to="/ecg"
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === '/ecg'
                ? darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Activity className="w-5 h-5 mr-3" />
            ECG Monitor
          </Link>
          <Link
            to="/reports"
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === '/reports'
                ? darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Reports
          </Link>
          <Link
            to="/how-to-use"
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === '/how-to-use'
                ? darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            How to Use
          </Link>
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === '/profile'
                ? darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <Link
            to="/settings"
            className={`flex items-center px-4 py-3 transition-colors duration-200 ${
              location.pathname === '/settings'
                ? darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 space-y-4">
          <button
            onClick={toggleDarkMode}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ${
              darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 mr-3" />
            ) : (
              <Moon className="w-5 h-5 mr-3" />
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button 
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ${
              darkMode
                ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-64 p-8 min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;