import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, Users, Compass, BookOpen, Layers } from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-brand-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                Phase 1
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer group">
              <Users className="w-4 h-4 text-brand-400" />
              <span>Learn with Friends</span>
              <Badge variant="neutral" size="sm" className="opacity-70 group-hover:opacity-100">
                Phase 2
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer group">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>Discover Partners</span>
              <Badge variant="neutral" size="sm" className="opacity-70 group-hover:opacity-100">
                Phase 2
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer group">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Study Sessions</span>
              <Badge variant="neutral" size="sm" className="opacity-70 group-hover:opacity-100">
                Upcoming
              </Badge>
            </div>
          </nav>

          {/* Actions & Status */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#architecture"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Architecture
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                alert('Authentication and student registration will be enabled in Phase 2.');
              }}
            >
              Student Portal (Phase 2)
            </Button>
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
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" /> Learn with Friends
            </span>
            <Badge variant="neutral" size="sm">Coming Phase 2</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" /> Discover Partners
            </span>
            <Badge variant="neutral" size="sm">Coming Phase 2</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> Study Sessions
            </span>
            <Badge variant="neutral" size="sm">Coming Phase 3</Badge>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                alert('Authentication will be available in Phase 2.');
              }}
            >
              Student Portal (Coming Phase 2)
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
