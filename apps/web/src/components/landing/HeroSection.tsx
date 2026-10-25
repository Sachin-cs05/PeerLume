import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  CheckCircle2,
  Video,
  Shield,
  Users,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

export const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const handleExploreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById('features');
    if (targetElement) {
      const headerOffset = 76;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-border/40"
    >
      {/* Subtle Monochrome Grid Background */}
      <div className="absolute inset-0 bg-subtle-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div
            className={`lg:col-span-6 space-y-6 text-center lg:text-left transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/80 text-foreground-secondary text-xs font-medium shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
              <span>Peer-to-Peer Student Learning Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Learn Together.<br />
              <span className="text-foreground-muted font-bold">Grow Together.</span>
            </h1>

            {/* Supporting Description */}
            <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
              Discover learning partners, share your skills, exchange knowledge, and collaborate
              with students who share your goals — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to={user ? '/discover' : '/register'} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {user ? 'Find Learning Partners' : 'Find Your Learning Partner'}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleExploreClick}
              >
                Explore Features
              </Button>
            </div>

            {/* Micro Highlights / Trust Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-foreground-muted border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                <span>Verified Student Network</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-foreground" />
                <span>Zero Ads or Distractions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-foreground" />
                <span>Collaborative Study Rooms</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Preview */}
          <div
            className={`lg:col-span-6 transition-all duration-700 delay-150 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Window Chrome Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                    <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                    <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-foreground-secondary">
                    learnpeer.workspace / algorithms-session
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-foreground-secondary">Room: Live (2 Peers)</span>
                </div>
              </div>

              {/* Inside Showcase Content */}
              <div className="p-4 sm:p-5 space-y-4 bg-card">
                {/* Session Header Card */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground">
                      DS
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-foreground">
                        Data Structures &amp; Algorithms
                      </div>
                      <div className="text-[11px] text-foreground-muted">
                        Graph Traversal &amp; Dynamic Programming
                      </div>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    In Progress
                  </Badge>
                </div>

                {/* Collaborative Code Snippet */}
                <div className="rounded-lg border border-border bg-background p-3.5 font-mono text-xs text-foreground-secondary space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-foreground-muted pb-2 border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-foreground" /> graph_bfs.ts
                    </span>
                    <span className="text-[11px] text-foreground font-mono">TypeScript</span>
                  </div>
                  <div className="space-y-1 text-[11.5px] leading-relaxed">
                    <p>
                      <span className="text-foreground font-semibold">export function</span>{' '}
                      <span className="text-foreground">bfs</span>(graph: Map&lt;string, string[]&gt;, start: string) &#123;
                    </p>
                    <p className="pl-4 text-foreground-muted">
                      // Visited set ensures acyclic traversal
                    </p>
                    <p className="pl-4">
                      <span className="text-foreground font-semibold">const</span> visited ={' '}
                      <span className="text-foreground font-semibold">new</span> Set&lt;string&gt;([start]);
                    </p>
                    <p className="pl-4">
                      <span className="text-foreground font-semibold">const</span> queue: string[] = [start];
                    </p>
                    <p className="pl-4 text-foreground">return Array.from(visited);</p>
                    <p>&#125;</p>
                  </div>
                </div>

                {/* Bottom Row: Matched Peer & Audio Call Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Matched Peer Card */}
                  <div className="p-3 rounded-lg border border-border bg-background space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground-muted uppercase tracking-wider">
                        Matched Peer
                      </span>
                      <span className="font-mono font-bold text-foreground">96% Match</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground">
                        EM
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">Elena Miller</div>
                        <div className="text-[10px] text-foreground-muted">CS • Semester 5</div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Call & Latency Card */}
                  <div className="p-3 rounded-lg border border-border bg-background flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground-muted uppercase tracking-wider">
                        WebRTC Voice
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Video className="w-3.5 h-3.5 text-foreground-muted" />
                        <span className="text-[11px]">Active Audio Call</span>
                      </div>
                      <span className="text-[10px] font-mono text-foreground-muted">18ms latency</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
