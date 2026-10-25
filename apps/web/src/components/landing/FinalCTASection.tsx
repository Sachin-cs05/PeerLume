import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

export const FinalCTASection: React.FC = () => {
  const { user } = useAuth();
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={ref} className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div
          className={`rounded-3xl border border-border bg-[#111113] text-white dark:bg-white dark:text-[#09090B] p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-98'
          }`}
        >
          {/* Subtle Accent Glow effect using monochrome contrast */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 dark:border-black/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Verified Students</span>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Your Next Learning Partner Is One Connection Away.
            </h2>
            <p className="text-sm sm:text-base opacity-80 leading-relaxed font-normal">
              Connect with fellow students, share your knowledge, and discover new ways to learn
              together. Zero fees, zero distractions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {user ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#09090B] dark:bg-[#09090B] dark:text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#09090B] dark:bg-[#09090B] dark:text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 dark:border-black/30 font-semibold text-sm hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer">
                    Log In to Account
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs opacity-70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Instant Account Activation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free for Students
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> End-to-End Privacy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
