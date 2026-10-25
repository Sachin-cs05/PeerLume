import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  Code2,
  Video,
  Terminal,
  Search,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

type TabId = 'dashboard' | 'partners' | 'messages' | 'workspace';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'partners', label: 'Find Partners', icon: <Compass className="w-4 h-4" /> },
  { id: 'messages', label: 'Messages & Calling', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'workspace', label: 'Collaborative Workspace', icon: <Code2 className="w-4 h-4" /> },
];

function useAnimatedCounter(target: number, decimals: number = 0, active: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    let startTimestamp: number | null = null;
    let frameId: number;
    const duration = 900;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * target;
      setCount(Number(current.toFixed(decimals)));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, decimals, active]);

  return count;
}

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  // Animated counters for dashboard tab
  const studyHours = useAnimatedCounter(34.5, 1, isVisible && activeTab === 'dashboard');
  const sessionsCount = useAnimatedCounter(18, 0, isVisible && activeTab === 'dashboard');
  const peersCount = useAnimatedCounter(12, 0, isVisible && activeTab === 'dashboard');
  const streakCount = useAnimatedCounter(7, 0, isVisible && activeTab === 'dashboard');

  return (
    <section id="showcase" ref={ref} className="py-16 md:py-24 border-b border-border/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-4 mb-10 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground-secondary text-xs font-medium">
            <span>Interactive Product Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Everything You Need to Learn Together.
          </h2>
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed font-normal">
            Take a hands-on preview of the core workflows inside PeerLearn. Built with focused,
            minimalist tools tailored for serious academic progress.
          </p>
        </div>

        {/* Tab Selection Bar with Sliding Transition */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto py-2">
          <div
            role="tablist"
            aria-label="Product Showcase Tabs"
            className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-card border border-border shadow-xs"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_16px_rgba(99,102,241,0.45)] scale-100'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover hover:scale-[1.02]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Window Container */}
        <div
          className={`rounded-2xl border border-border/80 dark:border-white/10 bg-card/90 backdrop-blur-xl shadow-glass shadow-indigo-500/5 hover:shadow-glow-sm overflow-hidden transition-all duration-500 border-t border-t-white/80 dark:border-t-white/15 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary text-xs text-foreground-muted select-none">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              </div>
              <span className="ml-2 font-mono text-[11px] text-foreground-secondary">
                peerlearn.app / {activeTab}
              </span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              <span className="text-[11px] text-foreground-secondary">Interactive Mode</span>
            </div>
          </div>

          {/* Tab Panels with smooth cross-fade animation */}
          <div className="p-4 sm:p-6 md:p-8 bg-card min-h-[440px]">
            {/* Panel 1: Dashboard with live counter animation */}
            {activeTab === 'dashboard' && (
              <div
                key="panel-dashboard"
                role="tabpanel"
                id="panel-dashboard"
                aria-labelledby="tab-dashboard"
                className="space-y-6 animate-fade-in"
              >
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl border border-border bg-background space-y-1 hover:border-border-strong transition-colors">
                    <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Study Hours
                    </span>
                    <div className="text-2xl font-extrabold text-foreground font-mono">
                      {studyHours} hrs
                    </div>
                    <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +12% this month
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background space-y-1 hover:border-border-strong transition-colors">
                    <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                      Completed Sessions
                    </span>
                    <div className="text-2xl font-extrabold text-foreground font-mono">
                      {sessionsCount}
                    </div>
                    <span className="text-[10px] text-foreground-muted">Across 4 subjects</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background space-y-1 hover:border-border-strong transition-colors">
                    <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                      Active Connections
                    </span>
                    <div className="text-2xl font-extrabold text-foreground font-mono">
                      {peersCount} Peers
                    </div>
                    <span className="text-[10px] text-foreground-muted">4 currently online</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background space-y-1 hover:border-border-strong transition-colors">
                    <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                      Study Streak
                    </span>
                    <div className="text-2xl font-extrabold text-foreground font-mono">
                      {streakCount} Days 🔥
                    </div>
                    <span className="text-[10px] text-foreground-muted">Personal record</span>
                  </div>
                </div>

                {/* Upcoming Sessions & Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-sm font-bold text-foreground">Upcoming Sessions</h4>
                      <span className="text-xs text-foreground-muted">2 scheduled today</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between hover:border-border-strong transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-xs">
                            CS
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-foreground">
                              Database Systems • Normalization &amp; B-Trees
                            </div>
                            <div className="text-[11px] text-foreground-muted flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Today, 4:00 PM - 5:00 PM
                              </span>
                              <span>• With Alex Rivera</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">
                          Confirmed
                        </Badge>
                      </div>

                      <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between hover:border-border-strong transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-xs">
                            OS
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-foreground">
                              Operating Systems • Deadlock Detection &amp; Threads
                            </div>
                            <div className="text-[11px] text-foreground-muted flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Tomorrow, 11:00 AM
                              </span>
                              <span>• With Priya Sharma</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">
                          Upcoming
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-sm font-bold text-foreground">Recent Activity</h4>
                      <span className="text-xs text-foreground-muted">Live sync</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-background space-y-3">
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse-dot" />
                        <div>
                          <p className="text-foreground font-medium">Alex Rivera shared a note</p>
                          <p className="text-foreground-muted text-[11px]">
                            "B+ Tree Insertion Algorithms.pdf" in Database Systems
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-foreground-muted mt-1.5 shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">Session completed with Sarah</p>
                          <p className="text-foreground-muted text-[11px]">
                            60 min collaborative code review in TypeScript
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: Find Partners */}
            {activeTab === 'partners' && (
              <div
                key="panel-partners"
                role="tabpanel"
                id="panel-partners"
                aria-labelledby="tab-partners"
                className="space-y-6 animate-fade-in"
              >
                {/* Search & Filter Mock Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pb-3 border-b border-border">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                    <input
                      type="text"
                      readOnly
                      value="Data Structures, Algorithms, React"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground-secondary font-medium">
                      Branch: Computer Science
                    </span>
                    <span className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground-secondary font-medium">
                      Semester: 5th
                    </span>
                  </div>
                </div>

                {/* Partner Result Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Partner 1 */}
                  <div className="p-4 rounded-xl border border-border bg-background space-y-3.5 flex flex-col justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground">
                            EM
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-foreground">Elena Miller</h5>
                            <p className="text-[11px] text-foreground-muted">IIT Bombay • Sem 5</p>
                          </div>
                        </div>
                        <Badge variant="brand" size="sm">
                          98% Match
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-foreground-muted uppercase">
                          Target Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            Graph Algorithms
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            Rust
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            Distributed Systems
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                      Request Study Session
                    </button>
                  </div>

                  {/* Partner 2 */}
                  <div className="p-4 rounded-xl border border-border bg-background space-y-3.5 flex flex-col justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground">
                            AR
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-foreground">Alex Rivera</h5>
                            <p className="text-[11px] text-foreground-muted">BITS Pilani • Sem 5</p>
                          </div>
                        </div>
                        <Badge variant="brand" size="sm">
                          94% Match
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-foreground-muted uppercase">
                          Target Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            Dynamic Programming
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            TypeScript
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            PostgreSQL
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                      Request Study Session
                    </button>
                  </div>

                  {/* Partner 3 */}
                  <div className="p-4 rounded-xl border border-border bg-background space-y-3.5 flex flex-col justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground">
                            SK
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-foreground">Siddharth Kumar</h5>
                            <p className="text-[11px] text-foreground-muted">NIT Trichy • Sem 6</p>
                          </div>
                        </div>
                        <Badge variant="brand" size="sm">
                          91% Match
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-foreground-muted uppercase">
                          Target Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            Computer Networks
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            Operating Systems
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border">
                            C++
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                      Request Study Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 3: Messages & Calling with Simulated Live Typing */}
            {activeTab === 'messages' && (
              <div
                key="panel-messages"
                role="tabpanel"
                id="panel-messages"
                aria-labelledby="tab-messages"
                className="space-y-4 animate-fade-in"
              >
                {/* Active Chat Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs">
                        EM
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-background animate-pulse-dot" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-foreground">Elena Miller</div>
                      <div className="text-[10px] text-foreground-muted">Online • Computer Science</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover border border-border text-[11px] font-medium text-foreground">
                      <Video className="w-3.5 h-3.5 text-emerald-500 animate-pulse-dot" />
                      <span>WebRTC Connected (24ms)</span>
                    </span>
                  </div>
                </div>

                {/* Message Conversation Flow */}
                <div className="p-4 rounded-xl border border-border bg-background space-y-3.5 text-xs">
                  {/* Message from Elena */}
                  <div className="flex items-start gap-2.5 max-w-lg">
                    <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                      EM
                    </div>
                    <div className="p-3 rounded-xl bg-surface-hover text-foreground space-y-1">
                      <p>
                        Hey! I implemented the recursive topological sort for our compiler course
                        homework. Want to review the cycle detection logic together?
                      </p>
                      <span className="text-[10px] text-foreground-muted block text-right">4:12 PM</span>
                    </div>
                  </div>

                  {/* Message from You with Code */}
                  <div className="flex items-start gap-2.5 max-w-lg ml-auto flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0">
                      ME
                    </div>
                    <div className="p-3 rounded-xl bg-foreground text-background space-y-1.5">
                      <p>
                        Definitely! Here is my 3-color DFS graph cycle checker in TypeScript. Let's test
                        it with a back-edge example in the code editor:
                      </p>
                      <div className="p-2 rounded bg-background text-foreground font-mono text-[11px] leading-relaxed">
                        <code>enum Color &#123; WHITE, GRAY, BLACK &#125;;</code>
                      </div>
                      <span className="text-[10px] text-background/70 block text-right">4:14 PM • Read</span>
                    </div>
                  </div>

                  {/* Elena Typing Indicator Simulation */}
                  <div className="flex items-center gap-2 text-foreground-muted text-[11px] pl-8 pt-1">
                    <span>Elena is typing</span>
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted animate-pulse [animation-delay:200ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted animate-pulse [animation-delay:400ms]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 4: Collaborative Workspace with Remote Live Cursor */}
            {activeTab === 'workspace' && (
              <div
                key="panel-workspace"
                role="tabpanel"
                id="panel-workspace"
                aria-labelledby="tab-workspace"
                className="space-y-4 animate-fade-in"
              >
                {/* Editor & Whiteboard Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: Code Editor (7 cols) */}
                  <div className="lg:col-span-7 rounded-xl border border-border bg-background p-4 space-y-2 font-mono text-xs relative">
                    <div className="flex items-center justify-between text-[11px] text-foreground-muted pb-2 border-b border-border">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-foreground" />
                        <span>lru_cache.ts</span>
                      </span>
                      <div className="flex items-center gap-2 font-sans">
                        <span className="px-2 py-0.5 rounded bg-surface-hover text-[10px] font-mono border border-border">
                          TypeScript 5.7
                        </span>
                        <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" /> Yjs Sync
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[12px] leading-relaxed pt-1 relative">
                      <p>
                        <span className="text-foreground font-semibold">class</span>{' '}
                        <span className="text-foreground">LRUCache</span>&lt;K, V&gt; &#123;
                      </p>
                      <p className="pl-4 text-foreground-muted">
                        // Doubly-linked list + HashMap for O(1) eviction
                      </p>
                      <p className="pl-4">
                        <span className="text-foreground font-semibold">private</span> map ={' '}
                        <span className="text-foreground font-semibold">new</span> Map&lt;K, Node&lt;K, V&gt;&gt;();
                      </p>
                      <p className="pl-4">
                        <span className="text-foreground font-semibold">get</span>(key: K): V | undefined &#123;
                      </p>
                      <p className="pl-8">
                        <span className="text-foreground font-semibold">const</span> node = this.map.get(key);
                      </p>
                      <p className="pl-8 text-foreground">if (!node) return undefined;</p>

                      {/* Line with Simulated Remote User Cursor */}
                      <p className="pl-8 relative flex items-center">
                        <span>this.moveToHead(node);</span>
                        <span className="inline-flex items-center ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-foreground text-background shadow-xs animate-float-subtle">
                          Alex Rivera
                        </span>
                      </p>

                      <p className="pl-8 text-foreground">return node.value;</p>
                      <p className="pl-4">&#125;</p>
                      <p>&#125;</p>
                    </div>
                  </div>

                  {/* Right: Live Interactive Whiteboard Note (5 cols) */}
                  <div className="lg:col-span-5 rounded-xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-border text-[11px]">
                        <span className="font-bold text-foreground">Whiteboard Derivation</span>
                        <Badge variant="neutral" size="sm">
                          Infinite Canvas
                        </Badge>
                      </div>

                      {/* Diagram Representation */}
                      <div className="p-3 rounded-lg border border-border/80 bg-surface-hover/30 space-y-2 font-mono text-[11px]">
                        <div className="text-center font-bold text-foreground transition-transform hover:scale-105">[ Head Node ]</div>
                        <div className="text-center text-foreground-muted">↕ next / prev</div>
                        <div className="p-2 rounded border border-border bg-background text-center font-semibold text-foreground hover:border-foreground/40 transition-colors">
                          Node(Key: "user_42", Val: Data)
                        </div>
                        <div className="text-center text-foreground-muted">↕ next / prev</div>
                        <div className="text-center font-bold text-foreground transition-transform hover:scale-105">[ Tail Node (LRU) ]</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-foreground-muted font-mono">
                      <span>Vector elements: 14</span>
                      <span>Canvas scale: 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
