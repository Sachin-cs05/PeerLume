import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@peerlume/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {APP_TAGLINE}
          </p>
        </div>

        {/* Real Links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/dashboard"
            className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/discover"
            className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            Discover
          </Link>
          <Link
            to="/profile"
            className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            Profile
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} PeerLume. Built for students.</p>
        <p className="flex items-center gap-1">
          Learn Together. Grow Together. <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-current" />
        </p>
      </div>
    </footer>
  );
};
