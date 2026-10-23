import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { NotificationDropdown } from '../components/notifications/NotificationDropdown.js';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal.js';
import { OfflineBanner } from '../components/common/OfflineBanner.js';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Global Ctrl+K / Cmd+K search shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-brand-600 dark:text-indigo-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                  Phase 7
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/study-rooms"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <Presentation className="w-4 h-4 text-rose-500" />
                    <span>Study Rooms</span>
                  </Link>

                  <Link
                    to="/code"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    <span>Code</span>
                  </Link>

                  <Link
                    to="/sessions"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Sessions</span>
                  </Link>

                  <Link
                    to="/workspace"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Workspace</span>
                  </Link>

                  <Link
                    to="/discover"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <Compass className="w-4 h-4 text-teal-500" />
                    <span>Discover</span>
                  </Link>

                  <Link
                    to="/chat"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Messages</span>
                  </Link>

                  <Link
                    to="/connections"
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors"
                  >
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Friends</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-brand-500" />
                    <span>Learn with Friends</span>
                    <Badge variant="brand" size="sm">Live</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Compass className="w-4 h-4 text-teal-500" />
                    <span>Discover Partners</span>
                    <Badge variant="brand" size="sm">Live</Badge>
                  </div>
                </>
              )}
            </nav>

            {/* Actions: Search, Theme Toggle, Notifications, Profile */}
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
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Join PeerLume
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
                {effectiveTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
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

        {/* Mobile dropdown */}
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
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/study-rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Study Rooms & Whiteboard</span>
                </Link>
                <Link
                  to="/code"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Code Editor</span>
                </Link>
                <Link
                  to="/sessions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Sessions & Calendar</span>
                </Link>
                <Link
                  to="/workspace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Study Workspace</span>
                </Link>
                <Link
                  to="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Discover Partners</span>
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Messages</span>
                </Link>
                <Link
                  to="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>Friends</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>My Profile</span>
                </Link>
                <div className="pt-2">
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
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-brand-500"
                >
                  Create Student Account
                </Link>
              </>
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
