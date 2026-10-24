import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  ArrowRight,
  Code2,
  BookOpen,
  Presentation,
  Calendar,
  Video,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Match with Peers',
    description: 'Find fellow students based on subject goals, current coursework, and complementary skills.',
    icon: <Compass className="w-5 h-5 text-foreground" />,
  },
  {
    step: '02',
    title: 'Collaborate in Real Time',
    description: 'Jump into interactive study rooms with live whiteboards, collaborative code editors, and audio.',
    icon: <Presentation className="w-5 h-5 text-foreground" />,
  },
  {
    step: '03',
    title: 'Track Academic Growth',
    description: 'Schedule recurring study blocks, organize shared resources, and hit your academic milestones.',
    icon: <Calendar className="w-5 h-5 text-foreground" />,
  },
];

const FEATURES = [
  {
    title: 'Algorithmic Peer Matching',
    description: 'Smart discovery algorithms connect you with peers learning the same course material.',
    icon: <Users className="w-4 h-4 text-foreground" />,
  },
  {
    title: 'Interactive Whiteboard',
    description: 'Sketch architectural diagrams, math derivations, and mind maps on an infinite canvas.',
    icon: <Presentation className="w-4 h-4 text-foreground" />,
  },
  {
    title: 'Collaborative Monaco Editor',
    description: 'Pair-program with real-time cursor tracking, syntax highlighting, and shared workspaces.',
    icon: <Code2 className="w-4 h-4 text-foreground" />,
  },
  {
    title: 'Direct Voice & Video Calling',
    description: 'Instant peer-to-peer WebRTC video and audio for zero-friction study conversations.',
    icon: <Video className="w-4 h-4 text-foreground" />,
  },
  {
    title: 'Session Management',
    description: 'Structured scheduling with time zone alignment, invitation tracking, and reminders.',
    icon: <Calendar className="w-4 h-4 text-foreground" />,
  },
  {
    title: 'Centralized Knowledge Hub',
    description: 'Store lecture notes, PDF resources, study guides, and shared links in one organized place.',
    icon: <BookOpen className="w-4 h-4 text-foreground" />,
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="py-12 md:py-20 space-y-20 md:space-y-32">
      {/* 1. Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
          <span>Student Peer-to-Peer Learning Platform</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
            Learn Together.<br />
            <span className="text-foreground-muted font-bold">Grow Together.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Connect with verified student peers, run focused study sessions, collaborate on code,
            and master complex concepts through structured peer learning.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Sign In to Account
            </Button>
          </Link>
        </div>

        {/* 2. Interactive Product Preview Component (SaaS Mockup using real UI tokens) */}
        <div className="pt-8">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card shadow-lg overflow-hidden text-left">
            {/* Window chrome header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-foreground-secondary">peerlearn.workspace / algorithms-session</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-foreground-secondary">Live Room: Active</span>
              </div>
            </div>

            {/* Inner Dashboard Preview */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-card">
              {/* Left Column: Real-time Study Workspace */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground">
                      DS
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Data Structures &amp; Algorithms</div>
                      <div className="text-xs text-foreground-muted">Graph Traversal &amp; Dynamic Programming</div>
                    </div>
                  </div>
                  <Badge variant="brand" size="sm">Session 04</Badge>
                </div>

                {/* Code / Study Canvas snippet */}
                <div className="rounded-lg border border-border bg-background p-4 font-mono text-xs text-foreground-secondary space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-foreground-muted pb-2 border-b border-border">
                    <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> graph_bfs.ts</span>
                    <span className="text-foreground">2 Peers Editing</span>
                  </div>
                  <div className="space-y-1 text-[12px] leading-relaxed">
                    <p><span className="text-foreground font-semibold">export function</span> <span className="text-foreground">bfs</span>(graph: Map&lt;string, string[]&gt;, start: string): string[] &#123;</p>
                    <p className="pl-4 text-foreground-muted">// Visited queue for breadth-first level search</p>
                    <p className="pl-4"><span className="text-foreground font-semibold">const</span> visited = <span className="text-foreground font-semibold">new</span> Set&lt;string&gt;([start]);</p>
                    <p className="pl-4"><span className="text-foreground font-semibold">const</span> queue: string[] = [start];</p>
                    <p className="pl-4 text-foreground">return Array.from(visited);</p>
                    <p>&#125;</p>
                  </div>
                </div>

                {/* Collaboration bar */}
                <div className="flex items-center justify-between text-xs text-foreground-secondary pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-surface-hover border border-border text-center text-[10px] leading-6 font-bold text-foreground">JS</div>
                      <div className="w-6 h-6 rounded-full bg-foreground text-background text-center text-[10px] leading-6 font-bold">AK</div>
                    </div>
                    <span className="text-[11px] text-foreground-muted">Alex and Sarah are collaborating</span>
                  </div>
                  <span className="text-[11px] font-mono text-foreground-muted">WebRTC: 24ms</span>
                </div>
              </div>

              {/* Right Column: Peer Recommendation & Next Session */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Matched Peer</span>
                    <span className="text-xs font-mono font-bold text-foreground">96% Match</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-sm text-foreground">
                      EM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Elena Miller</h4>
                      <p className="text-xs text-foreground-muted">Computer Science • Sem 5</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-hover border border-border text-foreground font-medium">Rust</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-hover border border-border text-foreground font-medium">Algorithms</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-hover border border-border text-foreground font-medium">Databases</span>
                  </div>

                  <div className="pt-1">
                    <button className="w-full py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                      Schedule Session
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-foreground-muted" />
                    <div>
                      <div className="font-semibold text-foreground">Next Meetup: Today, 6:00 PM</div>
                      <div className="text-foreground-muted text-[11px]">Exam Prep with 2 peers</div>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">Scheduled</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">How PeerLearn Works</h2>
          <p className="text-foreground-secondary text-sm max-w-lg mx-auto">
            A three-step workflow designed to make student knowledge exchange effective and accountable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card key={step.step} className="p-6 space-y-4" hoverEffect>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-surface-hover border border-border flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="font-mono text-sm font-bold text-foreground-muted select-none">{step.step}</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Engineered for Modern Study Groups
          </h2>
          <p className="text-foreground-secondary text-sm max-w-lg mx-auto">
            Every tool required to exchange knowledge, pair program, and maintain study consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-5 space-y-2.5" hoverEffect>
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Trust & Quality Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-hover border border-border flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Verified Student Platform</h3>
              <p className="text-xs sm:text-sm text-foreground-secondary">
                Designed exclusively for students with authenticated university profiles and zero distractions.
              </p>
            </div>
          </div>
          <Link to="/register" className="shrink-0">
            <Button variant="secondary" size="md">
              Create Profile
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. Final Call-to-Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-foreground text-background p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-background tracking-tight">
            Ready to study smarter with your peers?
          </h2>
          <p className="text-background/80 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Join students from top colleges collaborating on PeerLearn. Find your learning partner in minutes.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <button className="px-6 py-2.5 rounded-lg bg-background text-foreground font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                Get started for free
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
