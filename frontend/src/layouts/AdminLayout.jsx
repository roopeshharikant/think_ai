import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../components/ThemeContext';
import Branding from '../components/auth/Branding';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/rbac', label: 'RBAC' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/batches', label: 'Batches' },
  { to: '/admin/enrollments', label: 'Enrollments' },
  { to: '/admin/modules', label: 'Modules' },
  { to: '/admin/lessons', label: 'Lessons' },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    dispatch(logout());
    navigate('/home');
  };

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode ? 'bg-[#151821] text-[#f1f3f9]' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-64 flex-col border-r p-6 sticky top-0 h-screen shrink-0 transition-colors duration-300 ${isDarkMode ? 'border-[#262b38] bg-[#1a1e2b]' : 'border-slate-200 bg-white'}`}>
        <Branding size="small" />
        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isDarkMode 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : isDarkMode 
                      ? 'text-[#94a3b8] hover:text-white hover:bg-[#222736]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <header className={`sticky top-0 flex items-center justify-between border-b px-4 sm:px-8 py-4 z-35 backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1e2b]/90 border-[#262b38]' : 'bg-white/90 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg border focus:outline-none cursor-pointer ${isDarkMode ? 'bg-[#222736] border-[#313849] text-[#94a3b8]' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
              aria-label="Toggle Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile-only brand mark */}
            <Link to="/admin/dashboard" className="md:hidden flex items-center gap-2 font-bold tracking-tight">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-mono text-[10px] font-bold shadow-[0_0_10px_rgba(147,51,235,0.4)]">tz</span>
              <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Thinkz<span className="text-purple-500">.ai</span></span>
            </Link>

            <p className={`text-sm hidden sm:block ${isDarkMode ? 'text-[#94a3b8]' : 'text-slate-600'}`}>Admin Console</p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors cursor-pointer text-sm font-semibold border ${isDarkMode ? 'bg-[#222736] border-[#313849] text-amber-300 hover:bg-[#2b3244]' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 px-2 sm:px-4 py-2 rounded-xl text-left border transition-colors cursor-pointer ${isDarkMode ? 'bg-[#222736] border-[#313849] hover:border-[#3d475d] text-white' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-sm'}`}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-600 flex items-center justify-center text-xs text-cyan-400 font-bold">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border ${isDarkMode ? 'border-[#222736]' : 'border-white'}`}></div>
                </div>
                <div className="text-left hidden sm:block">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Admin'}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-[#94a3b8]' : 'text-slate-500'}`}>{user?.role || 'System Admin'}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className={`absolute top-full right-0 mt-2 w-48 border rounded-lg shadow-xl z-20 overflow-hidden ${isDarkMode ? 'bg-[#1a1e2b] border-[#262b38] text-[#f1f3f9]' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <ul className="text-sm">
                    <li>
                      <NavLink to="/admin/profile" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isDarkMode ? 'hover:bg-[#222736]' : 'hover:bg-slate-100'}`}>
                        View Profile
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/profile/edit" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isDarkMode ? 'hover:bg-[#222736]' : 'hover:bg-slate-100'}`}>
                        Edit Profile
                      </NavLink>
                    </li>
                    <li className={`border-t ${isDarkMode ? 'border-[#262b38]' : 'border-slate-100'}`}></li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left cursor-pointer text-rose-500 ${isDarkMode ? 'hover:bg-[#222736]' : 'hover:bg-rose-50'}`}
                      >
                        Log out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-b px-4 py-4 space-y-1 shadow-xl z-30 relative transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1e2b] text-white border-[#262b38]' : 'bg-white text-slate-900 border-slate-200'}`}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? isDarkMode 
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                        : 'bg-cyan-50 text-cyan-700'
                      : isDarkMode 
                        ? 'text-[#94a3b8] hover:text-white hover:bg-[#222736]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Main Content View with Page Scroll Support */}
        <main className="flex-1 p-4 sm:p-8 z-0">
          <Outlet />
        </main>
      </div>

      {(isDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 bg-transparent z-20"
          onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}
        />
      )}
    </div>
  );
}