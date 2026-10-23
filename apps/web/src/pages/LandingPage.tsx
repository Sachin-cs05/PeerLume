import React from 'react';
import {
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  BookOpen,
  Activity,
  CheckCircle2,
  RefreshCw,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import { useHealth } from '../hooks/useHealth.js';
import { APP_TAGLINE } from '@peerlume/shared';

export const LandingPage: React.FC = () => {
  const { data: healthData, loading: healthLoading, error: healthError, refetch } = useHealth();

  return (
    <div className="relative overflow-hidden py-10 md:py-16 space-y-24">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-purple-600/15 to-teal-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[300px] bg-gradient-to-br from-indigo-500/10 via-brand-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Peer-to-Peer Learning Platform • Phase 1 Foundation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          {APP_TAGLINE.split('.')[0]}.<br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            {APP_TAGLINE.split('.')[1] || 'Grow Together.'}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          PeerLume connects students to learn from friends and discover new study partners.
          Share real-time knowledge, collaborate on code, schedule study sessions, and grow without
          centralized administrative gatekeepers.
        </p>

        {/* Phase 1 Status Banner */}
        <div className="pt-2">
          <Alert variant="info" className="max-w-xl mx-auto text-left">
            <span className="font-semibold text-brand-300">Phase 1 Architecture Active:</span> Core monorepo, Express REST API, PostgreSQL Prisma foundation, and responsive frontend are live. Authentication, chat, matching, and study rooms will arrive in upcoming phases.
          </Alert>
        </div>

        {/* Call to Actions (clearly framed for Phase 1 vs Future) */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              const el = document.getElementById('learning-modes');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Learning Modes
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              const el = document.getElementById('system-health');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            System Status & Health
          </Button>
        </div>
      </section>

      {/* Two Primary Learning Modes Section */}
      <section id="learning-modes" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="brand" size="md">Core Learning Paradigms</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Designed for Peer Mastery
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Every student learns differently. PeerLume offers two distinct learning pathways to support both existing study circles and open discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mode 1: Learn with Friends */}
          <Card hoverEffect className="relative flex flex-col justify-between border-slate-700/60 bg-gradient-to-b from-slate-800/60 to-slate-900/60 p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Users className="w-6 h-6" />
                </div>
                <Badge variant="brand" size="sm">Phase 2 Feature</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Learn with Friends
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Study and share knowledge directly with your trusted network of friends, classmates, and teammates.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Friend Study Circles:</strong> Form private or group spaces for specific subjects.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Study Session Coordination:</strong> Schedule collaborative times without app switching.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Collaborative Notes & Code:</strong> Co-edit problem sets and projects in real time.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-400" />
                Self-governed student connections
              </span>
              <span className="font-medium text-brand-400">Coming in Phase 2</span>
            </div>
          </Card>

          {/* Mode 2: Discover Learning Partners */}
          <Card hoverEffect className="relative flex flex-col justify-between border-slate-700/60 bg-gradient-to-b from-slate-800/60 to-slate-900/60 p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Compass className="w-6 h-6" />
                </div>
                <Badge variant="success" size="sm">Phase 2 Feature</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Discover Learning Partners
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Find compatible study partners based on mutual skills, active courses, topics of interest, and target goals.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Skill & Goal Matching:</strong> Discover peers who want to learn what you know, and vice versa.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Curriculum Alignment:</strong> Connect with students working through the exact same syllabus.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Automated Safety & Abuse Prevention:</strong> Safe peer discovery without intrusive admins.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Privacy-first discovery profile
              </span>
              <span className="font-medium text-teal-400">Coming in Phase 2</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Concise Peer-to-Peer Learning Explanation */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8 bg-slate-900/60">
          <div className="max-w-3xl space-y-3">
            <Badge variant="warning" size="md">Why PeerLume</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              The Power of True Peer-to-Peer Learning
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Traditional platforms rely on one-way lectures or hierarchical instructor models.
              PeerLume embraces the scientifically proven <strong>Protégé Effect</strong>: students learn and retain material significantly faster when they explain concepts to, and collaborate directly with, fellow students.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-brand-400 flex items-center gap-2 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Admin Hierarchy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                No admin dashboard or teacher role. Students manage their own connections, schedule sessions, and protect their learning spaces.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-teal-400 flex items-center gap-2 font-semibold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Modern Full-Stack Stack</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built with React, TypeScript, Express, PostgreSQL, and Prisma. Engineered for security, maintainability, and zero bloat.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-amber-400 flex items-center gap-2 font-semibold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Structured Growth</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step phased development. Foundations established first, followed by secure authentication and collaborative tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Health & Foundation Telemetry */}
      <section id="system-health" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-400" />
              <h3 className="text-xl font-bold text-white">Live Platform Health Verification</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time telemetry querying the Express REST API health endpoint (`GET /api/health`).
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={healthLoading}
          >
            Refresh Status
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 space-y-6">
          {healthError && (
            <Alert variant="warning" title="API Connectivity Notice">
              {healthError}. Ensure the backend server is running (`npm run dev:api`).
            </Alert>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">API Status</span>
              {healthLoading ? (
                <span className="text-xs text-slate-400 animate-pulse">Checking...</span>
              ) : healthData ? (
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${healthData.status === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-sm font-semibold capitalize text-white">{healthData.status}</span>
                </div>
              ) : (
                <span className="text-xs text-rose-400">Unavailable</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Environment</span>
              <span className="text-sm font-semibold text-white font-mono">
                {healthData?.environment || 'unknown'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">API Version</span>
              <span className="text-sm font-semibold text-white font-mono">
                v{healthData?.version || '0.1.0'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Uptime</span>
              <span className="text-sm font-semibold text-white font-mono">
                {healthData ? `${healthData.uptimeSeconds}s` : '—'}
              </span>
            </div>
          </div>

          {/* Database Connectivity Probe Display */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-300 font-medium">PostgreSQL Database Engine: </span>
                <span className="text-slate-400">
                  {healthData?.database?.status === 'connected'
                    ? `Connected (${healthData.database.latencyMs}ms latency)`
                    : healthData?.database?.message || 'Configured via Prisma; pending active PostgreSQL service'}
                </span>
              </div>
            </div>
            <Badge
              variant={
                healthData?.database?.status === 'connected'
                  ? 'success'
                  : 'warning'
              }
              size="sm"
            >
              {healthData?.database?.status === 'connected' ? 'Connected' : 'Setup Ready'}
            </Badge>
          </div>
        </Card>
      </section>

      {/* Architecture & Roadmap Section */}
      <section id="architecture" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="neutral" size="sm">Roadmap Breakdown</Badge>
          <h3 className="text-2xl font-bold text-white">Development Phases</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-300">Phase 1 (Current)</span>
              <Badge variant="brand" size="sm">Foundation</Badge>
            </div>
            <p className="text-slate-300">
              Monorepo setup, Express REST API, Prisma ORM schema, error handling, Tailwind UI components, and landing page foundation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Phase 2 (Upcoming)</span>
              <Badge variant="neutral" size="sm">Planned</Badge>
            </div>
            <p className="text-slate-400">
              Student account creation, secure JWT authentication, student profiles, friend requests, and skill-based partner discovery.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Phase 3+ (Future)</span>
              <Badge variant="neutral" size="sm">Planned</Badge>
            </div>
            <p className="text-slate-400">
              Real-time messaging, audio/video peer rooms, synchronized code collaboration editor, and automated study scheduling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
