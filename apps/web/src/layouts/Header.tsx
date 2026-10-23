import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, Users, Compass, BookOpen, User, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { NotificationDropdown } from '../components/notifications/NotificationDropdown.js';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
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
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                PeerLume
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-emerald-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Phase 4
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/discover"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Discover Partners</span>
                </Link>

                <Link
                  to="/connections"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>Connections</span>
                </Link>

                <Link
                  to="/chat"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>My Profile</span>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group cursor-default">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>Learn with Friends</span>
                  <Badge variant="brand" size="sm">
                    Live
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group cursor-default">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Discover Partners</span>
                  <Badge variant="brand" size="sm">
                    Live
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400 group cursor-default">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Study Sessions</span>
                  <Badge variant="neutral" size="sm" className="opacity-70">
                    Phase 3
                  </Badge>
                </div>
              </>
            )}
          </nav>

          {/* Actions & Status */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
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
              <div className="flex items-center gap-3">
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
          <div className="md:hidden flex items-center">
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
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-2 pb-6 space-y-3">
          {user ? (
            <>
              <div className="py-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                Signed in as <span className="text-white">{user.fullName}</span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-300"
              >
                <span>Dashboard</span>
              </Link>
              <Link
                to="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-300"
              >
                <span>Discover Partners</span>
              </Link>
              <Link
                to="/connections"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-300"
              >
                <span>Connections</span>
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-300"
              >
                <span>Messages</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-300"
              >
                <span>My Profile</span>
              </Link>
              <Link
                to="/profile/edit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-300"
              >
                <span>Edit Skills</span>
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
                className="block py-2 text-sm font-medium text-slate-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-brand-400"
              >
                Create Student Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
