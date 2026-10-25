import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, X } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const [legalModalContent, setLegalModalContent] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.getElementById(href.substring(1));
      if (targetElement) {
        const headerOffset = 76;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  const openPrivacyModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setLegalModalContent({
      title: 'Privacy Policy',
      body: 'LearnPeer is committed to preserving student privacy. We do not sell your personal information, search history, or session data to any advertisers or third-party brokers. Passwords are encrypted with Argon2id, session tokens are signed cryptographically, and video/audio calls are established peer-to-peer over WebRTC with end-to-end data transfer.',
    });
  };

  const openTermsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setLegalModalContent({
      title: 'Terms of Service',
      body: 'By accessing LearnPeer, you agree to treat fellow student peers with mutual academic respect. Harassment, unauthorized spam, cheating on proctored examinations, or academic dishonesty will result in immediate profile suspension. LearnPeer is provided to foster collective student learning, peer instruction, and open collaboration.',
    });
  };

  const openHonorCodeModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setLegalModalContent({
      title: 'Student Honor Code',
      body: 'LearnPeer operates on student trust and integrity. We encourage open code reviews, derivation walkthroughs, and conceptual tutoring. Members pledge to learn through understanding and constructive questioning, rather than copying or plagiarizing peer assignments.',
    });
  };

  return (
    <>
      <footer className="border-t border-border bg-background-secondary/80 text-foreground-secondary py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-border/60">
            {/* Brand Col (2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-4">
              <a
                href="#hero"
                onClick={(e) => handleAnchorClick(e, '#hero')}
                className="flex items-center gap-2.5 group cursor-pointer inline-flex"
                aria-label="LearnPeer home"
              >
                <div className="w-8 h-8 rounded-lg bg-[#111113] text-white dark:bg-white dark:text-[#09090B] flex items-center justify-center font-bold text-sm shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-lg font-bold tracking-tight text-foreground">Learn</span>
                  <span className="text-lg font-normal text-foreground-secondary tracking-tight">
                    Peer
                  </span>
                </div>
              </a>

              <p className="text-xs sm:text-sm text-foreground-secondary max-w-sm leading-relaxed font-normal">
                A minimalist, high-performance peer-to-peer student collaboration platform. Discover
                learning partners, schedule study blocks, pair program, and master complex skills
                together.
              </p>

              <div className="pt-1 text-xs text-foreground-muted font-mono">
                Learn Together. Grow Together.
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-foreground tracking-tight text-xs uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleAnchorClick(e, '#features')}
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    onClick={(e) => handleAnchorClick(e, '#how-it-works')}
                    className="hover:text-foreground transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#showcase"
                    onClick={(e) => handleAnchorClick(e, '#showcase')}
                    className="hover:text-foreground transition-colors"
                  >
                    Interactive Showcase
                  </a>
                </li>
                <li>
                  <a
                    href="#why-learnpeer"
                    onClick={(e) => handleAnchorClick(e, '#why-learnpeer')}
                    className="hover:text-foreground transition-colors"
                  >
                    Why LearnPeer
                  </a>
                </li>
                <li>
                  <Link to="/discover" className="hover:text-foreground transition-colors">
                    Find Partners
                  </Link>
                </li>
              </ul>
            </div>

            {/* Workspaces & Rooms */}
            <div className="space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-foreground tracking-tight text-xs uppercase tracking-wider">
                Workspace
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/study-rooms" className="hover:text-foreground transition-colors">
                    Interactive Study Rooms
                  </Link>
                </li>
                <li>
                  <Link to="/code" className="hover:text-foreground transition-colors">
                    Collaborative Code Editor
                  </Link>
                </li>
                <li>
                  <Link to="/workspace" className="hover:text-foreground transition-colors">
                    Shared Learning Notes
                  </Link>
                </li>
                <li>
                  <Link to="/sessions" className="hover:text-foreground transition-colors">
                    Study Session Scheduling
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="hover:text-foreground transition-colors">
                    Real-Time Messaging
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-foreground tracking-tight text-xs uppercase tracking-wider">
                Support &amp; Trust
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => handleAnchorClick(e, '#faq')}
                    className="hover:text-foreground transition-colors"
                  >
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <button
                    onClick={openPrivacyModal}
                    className="hover:text-foreground transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={openTermsModal}
                    className="hover:text-foreground transition-colors cursor-pointer text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={openHonorCodeModal}
                    className="hover:text-foreground transition-colors cursor-pointer text-left"
                  >
                    Student Honor Code
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-foreground-muted gap-3">
            <p>© {new Date().getFullYear()} LearnPeer. Engineered for student peer collaboration.</p>
            <p className="text-foreground-muted">
              Built with precision • Monochrome Black &amp; White design system
            </p>
          </div>
        </div>
      </footer>

      {/* Accessible Legal / Policy Modal Dialog */}
      {legalModalContent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 id="legal-modal-title" className="text-base font-bold text-foreground">
                {legalModalContent.title}
              </h3>
              <button
                onClick={() => setLegalModalContent(null)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
              {legalModalContent.body}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setLegalModalContent(null)}
                className="px-4 py-2 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
