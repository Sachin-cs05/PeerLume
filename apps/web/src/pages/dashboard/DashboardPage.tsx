import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Target,
  Compass,
  ArrowRight,
  Mail,
  Plus,
  CheckCircle2,
  User,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome & Quick Actions Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Learning Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.fullName || 'Student'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your peer study hours, upcoming scheduled sessions, and shared knowledge resources.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/sessions">
            <Button variant="primary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Schedule Session
            </Button>
          </Link>
          <Link to="/workspace">
            <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
              Workspace
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="outline" size="sm" leftIcon={<Compass className="w-4 h-4" />}>
              Find Partners
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Getting Started Guide for New Students */}
      {!allStepsComplete && !loading && (
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-950/40 via-slate-900 to-indigo-950/30 p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Getting Started</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Welcome to PeerLume! Complete your setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Follow these quick steps to find compatible study partners and start learning together.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 self-start sm:self-auto border border-slate-700">
              {[isProfileComplete, isPartnerFound, isSessionScheduled].filter(Boolean).length} of 3 completed
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link
              to="/profile/edit"
              className={`group p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isProfileComplete
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-brand-500/50'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${isProfileComplete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'}`}>
                  <User className="w-5 h-5" />
                </div>
                {isProfileComplete ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    Step 1
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                  1. Complete your profile
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Add skills you can teach and subjects you want to learn.
                </p>
              </div>
            </Link>

            <Link
              to="/discover"
              className={`group p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isPartnerFound
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-brand-500/50'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${isPartnerFound ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'}`}>
                  <Compass className="w-5 h-5" />
                </div>
                {isPartnerFound ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    Step 2
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                  2. Find a study partner
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Discover peer learners by matching subjects or campus.
                </p>
              </div>
            </Link>

            <Link
              to="/sessions"
              className={`group p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isSessionScheduled
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-brand-500/50'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${isSessionScheduled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                {isSessionScheduled ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    Step 3
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                  3. Schedule your first session
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pick a time to study, collaborate on code, or brainstorm.
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

      {/* Real Statistics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardSummaryCard
          title="Total Study Hours"
          value={`${summary?.totalStudyHours ?? 0} hrs`}
          subtitle="Derived from completed peer sessions"
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-emerald-500/10 border-emerald-500/20"
          iconTextColor="text-emerald-400"
        />

        <DashboardSummaryCard
          title="Completed Sessions"
          value={summary?.completedSessionsCount ?? 0}
          subtitle="Peer learning sessions attended"
          icon={<Award className="w-6 h-6" />}
          iconBgColor="bg-purple-500/10 border-purple-500/20"
          iconTextColor="text-purple-400"
        />

        <DashboardSummaryCard
          title="Upcoming Sessions"
          value={summary?.upcomingSessionsCount ?? 0}
          subtitle="Scheduled on your calendar"
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-brand-500/10 border-brand-500/20"
          iconTextColor="text-brand-400"
        />

        <DashboardSummaryCard
          title="Learning Goals"
          value={summary?.learningGoalsCount ?? profile?.learningGoals?.length ?? 0}
          subtitle={`${summary?.teachingSkillsCount ?? profile?.teachingSkills?.length ?? 0} teaching skills offered`}
          icon={<Target className="w-6 h-6" />}
          iconBgColor="bg-blue-500/10 border-blue-500/20"
          iconTextColor="text-blue-400"
        />
      </div>

      {/* Pending Session Invitations Alert Section */}
      {summary?.pendingInvitations && summary.pendingInvitations.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Pending Session Invitations ({summary.pendingInvitations.length})
                </h3>
                <p className="text-xs text-amber-300">
                  Respond to your partners to confirm study sessions
                </p>
              </div>
            </div>
            <Link to="/sessions?tab=invitations">
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

      {/* Main Content Grid: Upcoming Sessions & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Upcoming Learning Sessions</h2>
              <p className="text-xs text-slate-400">Next scheduled collaborative activities</p>
            </div>
            <Link to="/sessions">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Calendar
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading sessions...</div>
          ) : !summary?.upcomingSessions || summary.upcomingSessions.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="No upcoming sessions"
              description="No upcoming sessions scheduled right now. Schedule one with a learning partner!"
              action={{
                label: 'Schedule Session',
                href: '/sessions',
                icon: <Plus className="w-4 h-4" />,
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary.upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onAccept={handleAcceptSession}
                  onDecline={handleDeclineSession}
                />
              ))}
            </div>
          )}

          {/* Recently Shared Workspace Resources */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Recent Workspace Resources</h2>
                <p className="text-xs text-slate-400">Study notes, code snippets, and shared files</p>
              </div>
              <Link to="/workspace">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open Workspace
                </Button>
              </Link>
            </div>

            {!summary?.recentResources || summary.recentResources.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
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
        </div>

        {/* Right 1 Col: Recent Activity Timeline & Skills Overview */}
        <div className="space-y-6">
          {/* Recent Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Recent Learning Activity</span>
            </h3>

            {!summary?.recentActivity || summary.recentActivity.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No recent activity logged yet.
              </div>
            ) : (
              <div className="space-y-4">
                {summary.recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold text-white truncate">{act.title}</div>
                      {act.description && (
                        <div className="text-[11px] text-slate-400 truncate">{act.description}</div>
                      )}
                      <div className="text-[10px] text-slate-500">
                        {new Date(act.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Skills & Goals Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Skills & Goals</h3>
              <Link to="/profile/edit" className="text-xs text-brand-400 hover:text-brand-300">
                Edit
              </Link>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Skills You Teach ({profile?.teachingSkills?.length ?? 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.teachingSkills?.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 rounded-lg text-xs bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium"
                    >
                      {s.name}
                    </span>
                  )) ?? <span className="text-xs text-slate-500">No skills added yet</span>}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Skills You Want to Learn ({profile?.learningGoals?.length ?? 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.learningGoals?.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 rounded-lg text-xs bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium"
                    >
                      {g.name}
                    </span>
                  )) ?? <span className="text-xs text-slate-500">No goals added yet</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
