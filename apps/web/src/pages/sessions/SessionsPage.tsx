import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LearningSessionDto } from '@peerlume/shared';
import { apiService } from '../../services/api.js';
import { SessionCard } from '../../components/sessions/SessionCard.js';
import { SessionForm } from '../../components/sessions/SessionForm.js';
import { CalendarView } from '../../components/sessions/CalendarView.js';
import { RescheduleDialog } from '../../components/sessions/RescheduleDialog.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import {
  Calendar,
  Plus,
  Clock,
  Mail,
  History,
  Sparkles,
  X,
} from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'upcoming';
  const initialPartnerId = searchParams.get('partnerId') || undefined;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'calendar' | 'invitations' | 'past'>(
    (currentTab as any) || 'upcoming'
  );

  const [sessions, setSessions] = useState<LearningSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(initialPartnerId));
  const [reschedulingSession, setReschedulingSession] = useState<LearningSessionDto | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.sessions.list();
      if (res.data) {
        setSessions(res.data);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTabChange = (tab: 'upcoming' | 'calendar' | 'invitations' | 'past') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Invitation actions
  const handleAccept = async (sessionId: string) => {
    try {
      const res = await apiService.sessions.accept(sessionId);
      if (res.data) {
        fetchSessions();
      }
    } catch {
      // Handled
    }
  };

  const handleDecline = async (sessionId: string) => {
    try {
      const res = await apiService.sessions.decline(sessionId);
      if (res.data) {
        fetchSessions();
      }
    } catch {
      // Handled
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this learning session?')) return;
    try {
      const res = await apiService.sessions.cancel(sessionId);
      if (res.data) {
        fetchSessions();
      }
    } catch {
      // Handled
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const res = await apiService.sessions.complete(sessionId);
      if (res.data) {
        fetchSessions();
      }
    } catch {
      // Handled
    }
  };

  const now = new Date();

  // Filter lists based on tab
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.endTime) >= now && ['ACCEPTED', 'PENDING', 'RESCHEDULE_REQUESTED'].includes(s.status)
  );

  const pendingInvitations = sessions.filter(
    (s) => s.status === 'PENDING' && new Date(s.endTime) >= now
  );

  const pastSessions = sessions.filter(
    (s) => new Date(s.endTime) < now || ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(s.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Session Scheduling • Phase 5</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Learning Sessions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Schedule, manage, and collaborate in peer study sessions with friends.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Schedule Session
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => handleTabChange('upcoming')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Upcoming</span>
          {upcomingSessions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-brand-500/20 text-brand-300 font-bold">
              {upcomingSessions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('calendar')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => handleTabChange('invitations')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'invitations'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Invitations</span>
          {pendingInvitations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 font-bold">
              {pendingInvitations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('past')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'past'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Session History</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading learning sessions...
        </div>
      ) : activeTab === 'calendar' ? (
        <CalendarView
          sessions={sessions}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onCancel={handleCancelSession}
          onOpenReschedule={(s) => setReschedulingSession(s)}
          onComplete={handleCompleteSession}
        />
      ) : activeTab === 'upcoming' ? (
        upcomingSessions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-white">No upcoming sessions</h3>
              <p className="text-xs text-slate-400">
                You have no active upcoming sessions. Schedule a session with one of your connected learning partners!
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Schedule a Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onCancel={handleCancelSession}
                onOpenReschedule={(s) => setReschedulingSession(s)}
                onComplete={handleCompleteSession}
              />
            ))}
          </div>
        )
      ) : activeTab === 'invitations' ? (
        pendingInvitations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No pending invitations</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! When partners invite you to learning sessions, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingInvitations.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onCancel={handleCancelSession}
                onOpenReschedule={(s) => setReschedulingSession(s)}
              />
            ))}
          </div>
        )
      ) : (
        /* Past Sessions Tab */
        pastSessions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No session history yet</h3>
            <p className="text-xs text-slate-400">
              Completed and past study sessions will be recorded here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )
      )}

      {/* Create Session Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Create Learning Session</h2>
              <p className="text-xs text-slate-400 mt-1">
                Invite connected friends for a focused online or in-person study session.
              </p>
            </div>

            <SessionForm
              initialInviteeId={initialPartnerId}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                fetchSessions();
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Reschedule Proposal Dialog */}
      {reschedulingSession && (
        <RescheduleDialog
          session={reschedulingSession}
          isOpen={Boolean(reschedulingSession)}
          onClose={() => setReschedulingSession(null)}
          onSuccess={() => fetchSessions()}
        />
      )}
    </div>
  );
};
