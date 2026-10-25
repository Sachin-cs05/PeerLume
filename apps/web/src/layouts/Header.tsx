import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
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
  Layers,
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

  const { user, logout } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
    return `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
      isActive
        ? 'text-foreground bg-surface-hover font-semibold shadow-2xs'
        : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover/70'
    }`;
  };

  return (
    <>
      <OfflineBanner />
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#111113] text-white dark:bg-white dark:text-[#09090B] flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Learn<span className="text-foreground-muted font-normal">Peer</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {user && (
                <>
                  <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                    <span>Dashboard</span>
                  </Link>

                  <Link to="/discover" className={getNavLinkClass('/discover')}>
                    <span>Discover</span>
                  </Link>

                  <Link to="/sessions" className={getNavLinkClass('/sessions')}>
                    <span>Sessions</span>
                  </Link>

                  <Link to="/chat" className={getNavLinkClass('/chat')}>
                    <span>Messages</span>
                  </Link>

                  <Link to="/workspace" className={getNavLinkClass('/workspace')}>
                    <span>Workspace</span>
                  </Link>

                  <Link to="/code" className={getNavLinkClass('/code')}>
                    <span>Code</span>
                  </Link>

                  <Link to="/study-rooms" className={getNavLinkClass('/study-rooms')}>
                    <span>Rooms</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Actions: Search, Theme Toggle, Notifications, Profile / Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Quick Search Button */}
              {user && (
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground-secondary hover:text-foreground bg-card hover:bg-surface-hover border border-border rounded-lg transition-colors cursor-pointer"
                  title="Search (Ctrl+K)"
                  aria-label="Open search dialog"
                >
                  <Search className="w-3.5 h-3.5 text-foreground-muted" />
                  <span>Search</span>
                  <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium bg-background border border-border rounded text-foreground-muted">
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Notifications */}
              {user && <NotificationDropdown />}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg text-foreground-secondary hover:text-foreground bg-card hover:bg-surface-hover border border-border transition-colors cursor-pointer"
                title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {effectiveTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-foreground" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2 pl-1 border-l border-border">
                  <Link
                    to="/profile"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border hover:border-foreground/40 text-foreground text-xs font-semibold transition-transform hover:scale-105"
                    title={user.fullName}
                  >
                    {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'ME'}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground bg-card border border-border"
                aria-label="Toggle theme"
              >
                {effectiveTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-foreground" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-foreground-secondary hover:text-foreground bg-card border border-border focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 shadow-lg">
            {user ? (
              <>
                <div className="py-2 border-b border-border text-xs text-foreground-secondary">
                  Signed in as <span className="text-foreground font-semibold">{user.fullName}</span>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium text-foreground-secondary hover:text-foreground bg-card rounded-lg border border-border"
                >
                  <Search className="w-4 h-4 text-foreground-muted" />
                  <span>Search PeerLearn (Ctrl+K)</span>
                </button>

                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/dashboard')}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/discover')}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Discover</span>
                  </Link>

                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/chat')}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                  </Link>

                  <Link
                    to="/connections"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/connections')}
                  >
                    <Users className="w-4 h-4" />
                    <span>Friends</span>
                  </Link>
                </div>

                {/* Mobile Study Section */}
                <div className="pt-2 border-t border-border space-y-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                    Study
                  </div>

                  <Link
                    to="/study-rooms"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/study-rooms')}
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Study Rooms</span>
                  </Link>

                  <Link
                    to="/sessions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/sessions')}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Sessions</span>
                  </Link>

                  <Link
                    to="/code"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/code')}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Code</span>
                  </Link>

                  <Link
                    to="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavLinkClass('/workspace')}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Workspace</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-border space-y-2">
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
