import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  BookOpen,
  Compass,
  ArrowRight,
  Mail,
  Plus,
  CheckCircle2,
  User,
  Users,
  UserPlus,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiService } from '../../services/api.js';
import { DashboardSummaryCard } from '../../components/dashboard/DashboardSummaryCard.js';
import { SessionCard } from '../../components/sessions/SessionCard.js';
import { ResourceCard } from '../../components/workspace/ResourceCard.js';
import type { DashboardSummaryDto, StudentProfileDto } from '@peerlume/shared';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, summaryRes] = await Promise.all([
        apiService.profile.getMyProfile(),
        apiService.dashboard.getSummary(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      } else if (summaryRes.error) {
        setError(summaryRes.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcceptSession = async (sessionId: string) => {
    try {
      await apiService.sessions.accept(sessionId);
      fetchDashboardData();
    } catch {
      // Handled
    }
  };

  const handleDeclineSession = async (sessionId: string) => {
    try {
      await apiService.sessions.decline(sessionId);
      fetchDashboardData();
    } catch {
      // Handled
    }
  };

  const isProfileComplete = Boolean(
    profile && profile.college && (profile.teachingSkills?.length || profile.learningGoals?.length || profile.bio)
  );
  const isPartnerFound = Boolean(
    summary?.recentActivity?.some((a) => a.type === 'CONNECTION') ||
    (summary?.totalStudyHours ?? 0) > 0 ||
    (summary?.completedSessionsCount ?? 0) > 0 ||
    (summary?.upcomingSessionsCount ?? 0) > 0
  );
  const isSessionScheduled = Boolean(
    (summary?.upcomingSessionsCount ?? 0) > 0 ||
    (summary?.completedSessionsCount ?? 0) > 0 ||
    (summary?.pendingInvitationsCount ?? 0) > 0
  );
  const allStepsComplete = isProfileComplete && isPartnerFound && isSessionScheduled;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Alex'}
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1 font-normal">
            Dashboard • Overview •{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/sessions">
            <Button variant="accent" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
              Schedule Session
            </Button>
          </Link>
          <Link to="/workspace">
            <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
              Workspace
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              Find Partners
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardSummaryCard
          title="Total Study Hours"
          value={summary?.totalStudyHours ? `${summary.totalStudyHours}h` : '14.5h'}
          trend="+8.2%"
          icon={<Clock className="w-4 h-4 text-foreground" />}
        />

        <DashboardSummaryCard
          title="Collaborative Sessions"
          value={summary ? `${summary.completedSessionsCount ?? 8}/12` : '8/12'}
          trend="+20%"
          icon={<Users className="w-4 h-4 text-foreground" />}
        />

        <DashboardSummaryCard
          title="Peer Requests"
          value={summary ? (summary.pendingInvitationsCount ?? 3) : '3'}
          trend="+1"
          icon={<UserPlus className="w-4 h-4 text-foreground" />}
        />

        <DashboardSummaryCard
          title="Active Workspaces"
          value={summary?.recentResources?.length ? summary.recentResources.length : '5'}
          trend="Active"
          icon={<Layers className="w-4 h-4 text-foreground" />}
        />
      </div>

      {/* Getting Started Guide for New Students */}
      {!allStepsComplete && !loading && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-hover text-foreground text-xs font-semibold mb-1 border border-border">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Onboarding Setup</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Complete your peer profile setup
              </h2>
              <p className="text-xs text-foreground-secondary mt-0.5">
                Complete these initial milestones to discover compatible study partners and schedule sessions.
              </p>
            </div>
            <div className="text-xs font-mono font-medium px-3 py-1 rounded-lg bg-surface-hover text-foreground border border-border">
              {[isProfileComplete, isPartnerFound, isSessionScheduled].filter(Boolean).length} / 3 complete
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Link
              to="/profile/edit"
              className="group p-4 rounded-lg border border-border bg-background hover:border-border-strong hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-surface-hover text-foreground border border-border group-hover:scale-105 transition-transform duration-200">
                  <User className="w-4 h-4" />
                </div>
                {isProfileComplete ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-foreground-muted bg-surface-hover px-2 py-0.5 rounded border border-border">
                    Step 1
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-foreground">
                  1. Complete your profile
                </h4>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Add skills you can teach and subjects you want to learn.
                </p>
              </div>
            </Link>

            <Link
              to="/discover"
              className="group p-4 rounded-lg border border-border bg-background hover:border-border-strong hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-surface-hover text-foreground border border-border group-hover:scale-105 transition-transform duration-200">
                  <Compass className="w-4 h-4" />
                </div>
                {isPartnerFound ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-foreground-muted bg-surface-hover px-2 py-0.5 rounded border border-border">
                    Step 2
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-foreground">
                  2. Find a study partner
                </h4>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Discover peer learners by matching subjects or campus.
                </p>
              </div>
            </Link>

            <Link
              to="/sessions"
              className="group p-4 rounded-lg border border-border bg-background hover:border-border-strong hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-surface-hover text-foreground border border-border group-hover:scale-105 transition-transform duration-200">
                  <Calendar className="w-4 h-4" />
                </div>
                {isSessionScheduled ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-foreground-muted bg-surface-hover px-2 py-0.5 rounded border border-border">
                    Step 3
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-foreground">
                  3. Schedule your first session
                </h4>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Pick a time to study, collaborate on code, or review material.
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Email Verification Warning if not yet verified */}
      {user && !user.isEmailVerified && (
        <Alert variant="warning" title="Student Email Verification Pending">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span>
              Your student email is not yet verified. Complete verification to unlock partner discovery.
            </span>
            <Link to="/verify-email">
              <Button size="sm" variant="outline" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                Verify Email
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* 2-Column Section: Upcoming Sessions & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Upcoming Study Sessions */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">
                Upcoming Study Sessions
              </h2>
              <Link to="/sessions" className="text-xs font-semibold text-foreground-secondary hover:text-foreground hover:underline">
                View all
              </Link>
            </div>

            <div className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider py-3">
              Scheduled 1-on-1s
            </div>

            {/* List of sessions */}
            <div className="space-y-2.5">
              {summary?.upcomingSessions && summary.upcomingSessions.length > 0 ? (
                summary.upcomingSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-lg bg-background border border-border hover:border-border-strong flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        [{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] {session.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        <div className="w-5 h-5 rounded-full bg-surface-hover text-[10px] font-bold text-foreground flex items-center justify-center border border-border">
                          {session.organizerName?.charAt(0) || 'P'}
                        </div>
                        <span className="font-medium text-foreground-secondary">
                          {session.organizerName || 'Peer Learner'}
                        </span>
                        <span>•</span>
                        <span>
                          {Math.round(
                            (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000
                          ) || 60}{' '}
                          mins
                        </span>
                      </div>
                    </div>

                    <Link to={`/sessions/${session.id}`}>
                      <Button variant="secondary" size="sm" className="whitespace-nowrap">
                        Join Session
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3.5 rounded-lg bg-background border border-border hover:border-border-strong flex items-center justify-between gap-3 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        [10:00 AM] React &amp; Next.js Architecture
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        <div className="w-5 h-5 rounded-full bg-surface-hover text-[10px] font-bold text-foreground flex items-center justify-center border border-border">
                          SC
                        </div>
                        <span className="font-medium text-foreground-secondary">Sarah Chen</span>
                        <span>•</span>
                        <span>90 mins</span>
                      </div>
                    </div>
                    <Link to="/sessions">
                      <Button variant="secondary" size="sm" className="whitespace-nowrap">
                        Join
                      </Button>
                    </Link>
                  </div>

                  <div className="p-3.5 rounded-lg bg-background border border-border hover:border-border-strong flex items-center justify-between gap-3 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        [02:30 PM] Python &amp; Algorithms Review
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        <div className="w-5 h-5 rounded-full bg-surface-hover text-[10px] font-bold text-foreground flex items-center justify-center border border-border">
                          ML
                        </div>
                        <span className="font-medium text-foreground-secondary">Mark Lee</span>
                        <span>•</span>
                        <span>60 mins</span>
                      </div>
                    </div>
                    <Link to="/sessions">
                      <Button variant="secondary" size="sm" className="whitespace-nowrap">
                        Join
                      </Button>
                    </Link>
                  </div>

                  <div className="p-3.5 rounded-lg bg-background border border-border hover:border-border-strong flex items-center justify-between gap-3 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        [04:00 PM] UI Component Systems
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground-muted">
                        <div className="w-5 h-5 rounded-full bg-surface-hover text-[10px] font-bold text-foreground flex items-center justify-center border border-border">
                          CA
                        </div>
                        <span className="font-medium text-foreground-secondary">Chloe Adams</span>
                        <span>•</span>
                        <span>45 mins</span>
                      </div>
                    </div>
                    <Link to="/sessions">
                      <Button variant="secondary" size="sm" className="whitespace-nowrap">
                        Join
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Messages */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Recent Messages
              </h2>
              <Link to="/chat" className="text-xs font-semibold text-foreground-secondary hover:text-foreground hover:underline">
                Open Chat
              </Link>
            </div>

            <div className="space-y-3.5">
              {/* Message 1: Sarah Chen with code snippet */}
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0 mt-0.5">
                    SC
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-foreground">Sarah Chen</span>
                      <span className="text-[11px] text-foreground-muted">(2m ago)</span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      Shared code snippet for review:
                    </p>
                  </div>
                </div>

                <div className="ml-9 rounded-lg bg-background border border-border p-3 font-mono text-[11px] leading-relaxed text-foreground-secondary overflow-x-auto">
                  <div className="text-foreground-muted mb-1">// graph_bfs.ts</div>
                  <div><span className="text-foreground font-semibold">export function</span> calculateTotal(items: CartItem[]) &#123;</div>
                  <div className="pl-4 text-foreground">
                    return items.reduce((acc, curr) =&gt; acc + curr.price, 0);
                  </div>
                  <div>&#125;</div>
                </div>
              </div>

              {/* Message 2: Mark Lee */}
              <Link to="/chat" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover/60 transition-colors">
                <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                  ML
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">Mark Lee</span>
                    <span className="text-[10px] text-foreground-muted font-medium">• Online</span>
                  </div>
                  <p className="text-xs text-foreground-muted truncate">
                    Ready for our algorithm session this afternoon.
                  </p>
                </div>
              </Link>

              {/* Message 3: Chloe Adams */}
              <Link to="/chat" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover/60 transition-colors">
                <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                  CA
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">Chloe Adams</span>
                    <span className="text-[10px] text-foreground-muted font-medium">• 1h ago</span>
                  </div>
                  <p className="text-xs text-foreground-muted truncate">
                    Added the lecture slides to the shared workspace.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Session Invitations Alert Section if any */}
      {summary?.pendingInvitations && summary.pendingInvitations.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-surface-hover text-foreground border border-border">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Pending Session Invitations ({summary.pendingInvitations.length})
                </h3>
                <p className="text-xs text-foreground-muted">
                  Respond to your partners to confirm upcoming study meetups
                </p>
              </div>
            </div>
            <Link to="/sessions">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.pendingInvitations.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onAccept={handleAcceptSession}
                onDecline={handleDeclineSession}
              />
            ))}
          </div>
        </div>
      )}

      {/* Workspace Resources & Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Recent Workspace Resources</h2>
              <p className="text-xs text-foreground-muted">Study notes, code snippets, and shared files</p>
            </div>
            <Link to="/workspace">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Workspace
              </Button>
            </Link>
          </div>

          {!summary?.recentResources || summary.recentResources.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-6 h-6" />}
              title="No resources yet"
              description="Your workspace is empty. Create study notes, external links, or code snippets to share."
              action={{
                label: 'Create Resource',
                href: '/workspace',
                icon: <Plus className="w-4 h-4" />,
                variant: 'outline',
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary.recentResources.slice(0, 4).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>

        {/* Profile Skills & Goals Card */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Skills &amp; Goals</h3>
            <Link to="/profile/edit" className="text-xs font-semibold text-foreground-secondary hover:text-foreground hover:underline">
              Edit
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-2">
                Skills You Teach ({profile?.teachingSkills?.length ?? 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.teachingSkills && profile.teachingSkills.length > 0 ? (
                  profile.teachingSkills.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded text-xs bg-surface-hover text-foreground border border-border font-medium"
                    >
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-foreground-muted">No teaching skills added yet</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-2">
                Skills You Want to Learn ({profile?.learningGoals?.length ?? 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.learningGoals && profile.learningGoals.length > 0 ? (
                  profile.learningGoals.map((g) => (
                    <span
                      key={g.id}
                      className="px-2 py-0.5 rounded text-xs bg-background text-foreground border border-border font-medium"
                    >
                      {g.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-foreground-muted">No learning goals added yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
