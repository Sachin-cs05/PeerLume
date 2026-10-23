import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { IncomingCallDialog } from '../components/calls/IncomingCallDialog.js';
import { CallModal } from '../components/calls/CallModal.js';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 bg-radial-glow">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      {/* Real-time Call Signaling & Calling UI */}
      <IncomingCallDialog />
      <CallModal />
    </div>
  );
};

