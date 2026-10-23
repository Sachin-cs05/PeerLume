import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  Users,
  Compass,
  BookOpen,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Code2,
  Presentation,
  Search,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { NotificationDropdown } from '../components/notifications/NotificationDropdown.js';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal.js';
import { OfflineBanner } from '../components/common/OfflineBanner.js';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [studyDropdownOpen, setStudyDropdownOpen] = useState(false);
  const studyDropdownRef = useRef<HTMLDivElement | null>(null);

  const { user, logout } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (studyDropdownRef.current && !studyDropdownRef.current.contains(e.target as Node)) {
        setStudyDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStudyDropdownOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setStudyDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isStudyActive = ['/study-rooms', '/sessions', '/code', '/workspace'].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
    return `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;
  };

  return (
    <>
      <OfflineBanner />
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-400 group-hover:text-brand-300" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 dark:from-white via-slate-700 dark:via-slate-200 to-brand-500 dark:to-brand-300 bg-clip-text text-transparent">
                  PeerLume
                </span>
              </div>
            </Link>

            {/* Desktop Navigation (At most 5 items when logged in; clean when logged out) */}
            <nav className="hidden md:flex items-center gap-2">
              {user && (
                <>
                  <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    <span>Dashboard</span>
                  </Link>

                  <Link to="/discover" className={getNavLinkClass('/discover')}>
                    <Compass className="w-4 h-4 text-teal-500" />
                    <span>Discover</span>
                  </Link>

                  <Link to="/chat" className={getNavLinkClass('/chat')}>
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Messages</span>
                  </Link>

                  <Link to="/connections" className={getNavLinkClass('/connections')}>
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Friends</span>
                  </Link>

                  {/* Study Dropdown */}
                  <div className="relative" ref={studyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setStudyDropdownOpen((prev) => !prev)}
                      aria-expanded={studyDropdownOpen}
                      aria-haspopup="true"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        isStudyActive
                          ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Study</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          studyDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {studyDropdownOpen && (
                      <div
                        role="menu"
                        className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                      >
                        <Link
                          to="/study-rooms"
                          role="menuitem"
                          onClick={() => setStudyDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group ${
                            location.pathname.startsWith('/study-rooms') ? 'bg-slate-100 dark:bg-slate-800/60' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 mt-0.5">
                            <Presentation className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500">
                              Study Rooms
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Interactive rooms & whiteboard
                            </div>
                          </div>
                        </Link>

                        <Link
                          to="/sessions"
                          role="menuitem"
                          onClick={() => setStudyDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group ${
                            location.pathname.startsWith('/sessions') ? 'bg-slate-100 dark:bg-slate-800/60' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500">
                              Sessions
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Scheduled calendar meetings
                            </div>
                          </div>
                        </Link>

                        <Link
                          to="/code"
                          role="menuitem"
                          onClick={() => setStudyDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group ${
                            location.pathname.startsWith('/code') ? 'bg-slate-100 dark:bg-slate-800/60' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500">
                              Code
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Real-time collaborative editor
                            </div>
                          </div>
                        </Link>

                        <Link
                          to="/workspace"
                          role="menuitem"
                          onClick={() => setStudyDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group ${
                            location.pathname.startsWith('/workspace') ? 'bg-slate-100 dark:bg-slate-800/60' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500">
                              Workspace
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Notes, snippets & resources
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </nav>

            {/* Actions: Search, Theme Toggle, Notifications, Profile / Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Quick Search Button */}
              {user && (
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
                  title="Search (Ctrl+K)"
                  aria-label="Open search dialog"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search...</span>
                  <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {effectiveTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2.5">
                  <NotificationDropdown />

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[110px] truncate">
                      {user.fullName}
                    </span>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                {effectiveTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
            {user ? (
              <>
                <div className="py-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Signed in as <span className="text-slate-900 dark:text-white">{user.fullName}</span>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <Search className="w-4 h-4 text-brand-500" />
                  <span>Search PeerLume (Ctrl+K)</span>
                </button>

                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/dashboard')}
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/discover')}
                  >
                    <Compass className="w-4 h-4 text-teal-500" />
                    <span>Discover</span>
                  </Link>

                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/chat')}
                  >
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Messages</span>
                  </Link>

                  <Link
                    to="/connections"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/connections')}
                  >
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Friends</span>
                  </Link>
                </div>

                {/* Mobile Study Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Study
                  </div>

                  <Link
                    to="/study-rooms"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/study-rooms')}
                  >
                    <Presentation className="w-4 h-4 text-rose-500" />
                    <span>Study Rooms</span>
                  </Link>

                  <Link
                    to="/sessions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/sessions')}
                  >
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Sessions</span>
                  </Link>

                  <Link
                    to="/code"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/code')}
                  >
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    <span>Code</span>
                  </Link>

                  <Link
                    to="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/workspace')}
                  >
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Workspace</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/profile')}
                  >
                    <span>My Profile</span>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button variant="ghost" size="md" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button variant="primary" size="md" className="w-full">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};
