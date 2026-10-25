import React from 'react';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

export const ProblemSolutionSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  const challenges = [
    {
      title: 'Isolated Solo Studying',
      description: 'Getting stuck on complex algorithmic concepts or derivations with no immediate peer to bounce ideas off.',
    },
    {
      title: 'Fragmented Study Tools',
      description: 'Juggling separate video apps, scattered code pastes, disconnected whiteboard tabs, and lost notes.',
    },
    {
      title: 'Unreliable Coordination',
      description: 'Endless back-and-forth messaging trying to find mutually available study hours across conflicting student schedules.',
    },
    {
      title: 'Lack of Peer Accountability',
      description: 'Setting ambitious study goals alone, only to abandon them when academic pressure and fatigue set in.',
    },
  ];

  const solutions = [
    {
      title: 'Targeted Peer Discovery',
      description: 'Match with students currently studying your exact curriculum, programming languages, and examination syllabus.',
    },
    {
      title: 'Unified Collaborative Suite',
      description: 'Work inside integrated study rooms featuring live Monaco code editing, infinite canvas, and peer voice.',
    },
    {
      title: 'Structured Session Management',
      description: 'Propose and accept study sessions with timezone alignment, calendar .ics sync, and automatic reminder alerts.',
    },
    {
      title: 'Shared Accountability Circles',
      description: 'Form study connections, share lecture materials, track milestone streaks, and grow together.',
    },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 border-b border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-4 mb-14 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>Why Collaboration Matters</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Learning Is Better When Knowledge Is Shared.
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Mastering tough academic subjects alone often leads to friction and burnout. PeerLearn
            bridges the gap between individual effort and collective student intelligence.
          </p>
        </div>

        {/* 2-Column Comparison Layout with Dual-Slide Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: The Problem (Slides from Left) */}
          <div
            className={`rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all duration-700 delay-100 ease-out hover:border-border-strong ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-foreground-muted">
                  <XCircle className="w-4 h-4 text-foreground-muted" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">The Solo Learning Struggle</h3>
                  <p className="text-xs text-foreground-muted">Common obstacles students face daily</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {challenges.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 group">
                    <div className="mt-1 w-4 h-4 rounded-full bg-surface-hover border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/40 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-foreground/90">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 text-xs text-foreground-muted">
              Working in silos often slows down comprehension and increases study anxiety.
            </div>
          </div>

          {/* Right Column: The PeerLearn Solution (Slides from Right) */}
          <div
            className={`rounded-2xl border border-foreground/30 bg-card p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-700 delay-150 ease-out hover:border-foreground/50 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center transition-transform hover:scale-105">
                  <CheckCircle2 className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">The PeerLearn Advantage</h3>
                  <p className="text-xs text-foreground-muted">Engineered for collective academic growth</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {solutions.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 group">
                    <div className="mt-1 w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <div className="w-1.5 h-1.5 rounded-full bg-background" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Accelerate your understanding</span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline group"
              >
                <span>Join a study circle</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
