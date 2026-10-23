import React from 'react';
import { ShieldAlert, Terminal, Heart } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@peerlume/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">{APP_NAME}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-300 italic">“{APP_TAGLINE}”</p>
          <p className="text-sm text-slate-400 max-w-md">
            PeerLume is a decentralized, peer-to-peer student learning network built for true collaboration, knowledge exchange, and student growth.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Autonomous architecture: No Admin role or Admin dashboard. Students govern their connections.</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Platform Pillars</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="hover:text-slate-200 transition-colors">Learn with Friends</li>
            <li className="hover:text-slate-200 transition-colors">Discover Learning Partners</li>
            <li className="hover:text-slate-200 transition-colors">Peer Study Rooms (Phase 3)</li>
            <li className="hover:text-slate-200 transition-colors">Code Collaboration (Phase 3)</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Foundation</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
              <Terminal className="w-3.5 h-3.5 text-brand-400" />
              <span>Node.js & Express REST API</span>
            </li>
            <li className="hover:text-slate-200 transition-colors">PostgreSQL & Prisma ORM</li>
            <li className="hover:text-slate-200 transition-colors">React & TypeScript Strict</li>
            <li className="hover:text-slate-200 transition-colors">Tailwind CSS System</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} PeerLume Platform. Built with care for students worldwide.</p>
        <p className="flex items-center gap-1">
          Designed for peer-driven mastery <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-current" />
        </p>
      </div>
    </footer>
  );
};
