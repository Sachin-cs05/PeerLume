import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@peerlume/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background-secondary text-foreground-secondary py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#111113] text-white dark:bg-white dark:text-[#09090B] flex items-center justify-center shadow-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <span className="hidden sm:inline text-foreground-muted">•</span>
          <p className="text-xs sm:text-sm font-normal text-foreground-muted">
            {APP_TAGLINE}
          </p>
        </div>

        {/* Real Links */}
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium">
          <Link
            to="/dashboard"
            className="text-foreground-secondary hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/discover"
            className="text-foreground-secondary hover:text-foreground transition-colors"
          >
            Discover
          </Link>
          <Link
            to="/sessions"
            className="text-foreground-secondary hover:text-foreground transition-colors"
          >
            Sessions
          </Link>
          <Link
            to="/workspace"
            className="text-foreground-secondary hover:text-foreground transition-colors"
          >
            Workspace
          </Link>
          <Link
            to="/profile"
            className="text-foreground-secondary hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-foreground-muted gap-2">
        <p>© {new Date().getFullYear()} PeerLearn. Designed for student peer collaboration.</p>
        <p className="text-foreground-muted">
          Minimalist &amp; high-performance monochrome workspace
        </p>
      </div>
    </footer>
  );
};
