import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { LearningSessionDto, LearningResourceDto } from '@peerlume/shared';
import { apiService } from '../../services/api.js';
import { SessionStatusBadge } from '../../components/sessions/SessionStatusBadge.js';
import { RescheduleDialog } from '../../components/sessions/RescheduleDialog.js';
import { ResourceCard } from '../../components/workspace/ResourceCard.js';
import { NoteEditor } from '../../components/workspace/NoteEditor.js';
import { FileUpload } from '../../components/workspace/FileUpload.js';
import { Button } from '../../components/ui/Button.js';
import { Alert } from '../../components/ui/Alert.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  ArrowLeft,
  RefreshCw,
  FileText,
  Upload,
  Check,
  X,
  Target,
  Code2,
  Download,
  Presentation,
} from 'lucide-react';

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();

  const [session, setSession] = useState<LearningSessionDto | null>(null);
  const [resources, setResources] = useState<LearningResourceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & sub-flows
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  const fetchSessionData = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const [sessionRes, resourcesRes] = await Promise.all([
        apiService.sessions.get(sessionId),
        apiService.resources.getSessionResources(sessionId),
      ]);

      if (sessionRes.data) {
        setSession(sessionRes.data);
      } else if (sessionRes.error) {
        setError(sessionRes.error);
      }

      if (resourcesRes.data) {
        setResources(resourcesRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Loading session details...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <Alert variant="error" title="Session Not Found">
          {error || 'Unable to load the requested learning session.'}
        </Alert>
        <Link to="/sessions">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Sessions
          </Button>
        </Link>
      </div>
    );
  }

  const isOrganizer = user?.id === session.organizerId;
  const myParticipant = session.participants.find((p) => p.userId === user?.id);
  const isPendingInvitee = myParticipant?.role === 'INVITEE' && myParticipant?.status === 'PENDING';

  const startDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

  const formattedDate = startDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })} – ${endDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  // Responding to Reschedule Proposal
  const pendingProposal = session.rescheduleProposals?.find((p) => p.status === 'PENDING');
  const canRespondProposal = pendingProposal && pendingProposal.proposerId !== user?.id;

  const handleRespondProposal = async (proposalId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await apiService.sessions.respondReschedule(session.id, proposalId, action);
      if (res.data) {
        fetchSessionData();
      }
    } catch {
      // Handled
    }
  };

  const handleAccept = async () => {
    try {
      const res = await apiService.sessions.accept(session.id);
      if (res.data) fetchSessionData();
    } catch {
      // Handled
    }
  };

  const handleDecline = async () => {
    try {
      const res = await apiService.sessions.decline(session.id);
      if (res.data) fetchSessionData();
    } catch {
      // Handled
    }
  };

  const handleCancelSession = async () => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    try {
      const res = await apiService.sessions.cancel(session.id);
      if (res.data) fetchSessionData();
    } catch {
      // Handled
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportIcs = async () => {
    if (!session) return;
    setIsExporting(true);
    try {
      await apiService.calendarExport.downloadSessionIcs(session.id, session.title);
    } catch (err: any) {
      alert(err.message || 'Failed to export session calendar');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCompleteSession = async () => {
    try {
      const res = await apiService.sessions.complete(session.id);
      if (res.data) fetchSessionData();
    } catch {
      // Handled
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <Link to="/sessions">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            All Sessions
          </Button>
        </Link>
        <SessionStatusBadge status={session.status} size="md" />
      </div>

      {/* Main Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-surface text-foreground-secondary border border-border mb-3">
            {session.topic}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {session.title}
          </h1>
          {session.description && (
            <p className="text-sm text-foreground-secondary mt-2 leading-relaxed">
              {session.description}
            </p>
          )}
        </div>

        {/* Schedule & Mode Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border-subtle">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-foreground-muted" />
              Date
            </span>
            <div className="text-xs font-semibold text-foreground">{formattedDate}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-foreground-muted" />
              Time ({session.timeZone})
            </span>
            <div className="text-xs font-semibold text-foreground">
              {formattedTime} ({durationMinutes}m)
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted flex items-center gap-1.5 uppercase tracking-wider">
              {session.mode === 'ONLINE' ? (
                <Video className="w-3.5 h-3.5 text-foreground-muted" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-foreground-muted" />
              )}
              Session Mode
            </span>
            <div className="text-xs font-semibold text-foreground">
              {session.mode === 'ONLINE' ? 'Online Video Call' : 'In-Person'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-foreground-muted" />
              Participants
            </span>
            <div className="text-xs font-semibold text-foreground">
              {session.participants.length} Students
            </div>
          </div>
        </div>

        {/* In-Person Location Info */}
        {session.mode === 'IN_PERSON' && session.location && (
          <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3 text-foreground-secondary text-xs">
            <MapPin className="w-4 h-4 text-foreground-muted shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-foreground">Location Details:</span>
              <span>{session.location}</span>
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {session.objectives && (
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <Target className="w-4 h-4 text-foreground-muted" />
              <span>Learning Objectives</span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed bg-surface p-3 rounded-lg border border-border-subtle">
              {session.objectives}
            </p>
          </div>
        )}

        {/* Preparation Notes */}
        {session.notes && (
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
              <FileText className="w-4 h-4 text-foreground-muted" />
              <span>Preparation & Instructions</span>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed bg-surface p-3 rounded-lg border border-border-subtle">
              {session.notes}
            </p>
          </div>
        )}

        {/* Primary Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {isPendingInvitee && (
              <>
                <Button variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />} onClick={handleAccept}>
                  Accept Invitation
                </Button>
                <Button variant="outline" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={handleDecline}>
                  Decline
                </Button>
              </>
            )}

            {session.status === 'ACCEPTED' && session.mode === 'ONLINE' && (
              <Link to={session.meetingUrl || `/chat?sessionTopic=${encodeURIComponent(session.topic)}`}>
                <Button variant="primary" size="sm" leftIcon={<Video className="w-4 h-4" />}>
                  Join Video / Audio Call
                </Button>
              </Link>
            )}

            {session.status === 'ACCEPTED' && (
              <Link to="/code">
                <Button variant="outline" size="sm" leftIcon={<Code2 className="w-4 h-4" />}>
                  Code Workspace
                </Button>
              </Link>
            )}

            {session.status === 'ACCEPTED' && (
              <Link to={`/study-rooms?sessionId=${session.id}`}>
                <Button variant="outline" size="sm" leftIcon={<Presentation className="w-4 h-4" />}>
                  Study Room
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-foreground-muted" />}
              onClick={handleExportIcs}
              isLoading={isExporting}
            >
              Export (.ics)
            </Button>

            {['PENDING', 'ACCEPTED'].includes(session.status) && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setIsRescheduleOpen(true)}
              >
                Propose Reschedule
              </Button>
            )}

            {session.status === 'ACCEPTED' && isOrganizer && (
              <Button variant="secondary" size="sm" onClick={handleCompleteSession}>
                Mark Completed
              </Button>
            )}
          </div>

          {['PENDING', 'ACCEPTED', 'RESCHEDULE_REQUESTED'].includes(session.status) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
              onClick={handleCancelSession}
            >
              Cancel Session
            </Button>
          )}
        </div>
      </div>

      {/* Reschedule Proposal Timeline & Banner */}
      {pendingProposal && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-surface border border-border text-foreground">
                <RefreshCw className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reschedule Proposal Pending</h3>
                <p className="text-xs text-foreground-muted">
                  Proposed by {pendingProposal.proposerName} on{' '}
                  {new Date(pendingProposal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {canRespondProposal && (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() => handleRespondProposal(pendingProposal.id, 'ACCEPT')}
                >
                  Accept Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={() => handleRespondProposal(pendingProposal.id, 'REJECT')}
                >
                  Reject Proposal
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface p-3.5 rounded-lg border border-border-subtle">
            <div>
              <span className="text-foreground-muted block mb-0.5">Proposed Time:</span>
              <span className="font-semibold text-foreground">
                {new Date(pendingProposal.proposedStartTime).toLocaleString()} (
                {pendingProposal.proposedTimeZone})
              </span>
            </div>
            {pendingProposal.reason && (
              <div>
                <span className="text-foreground-muted block mb-0.5">Reason:</span>
                <span className="text-foreground-secondary italic">{pendingProposal.reason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Session Participants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {session.participants.map((p) => (
            <div
              key={p.id}
              className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                  {p.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>{p.fullName}</span>
                    {p.role === 'ORGANIZER' && (
                      <span className="text-[10px] font-semibold bg-surface border border-border text-foreground-secondary px-2 py-0.5 rounded-full">
                        Organizer
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground-muted">{p.college || 'Peer Student'}</div>
                </div>
              </div>

              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    p.status === 'ACCEPTED'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      : p.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Knowledge-Sharing Workspace Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Session Workspace & Resources</h2>
            <p className="text-xs text-foreground-muted">
              Shared study notes, code snippets, links, and documents for this session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => setIsNoteEditorOpen(true)}
            >
              Add Note
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setIsFileUploadOpen(true)}
            >
              Upload Document
            </Button>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-foreground-muted space-y-2 shadow-sm">
            <FileText className="w-8 h-8 text-foreground-muted mx-auto" />
            <p>No workspace resources attached to this session yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onDelete={async (id) => {
                  if (!window.confirm('Delete this resource?')) return;
                  await apiService.resources.delete(id);
                  fetchSessionData();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Dialog Modal */}
      {isRescheduleOpen && (
        <RescheduleDialog
          session={session}
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          onSuccess={() => fetchSessionData()}
        />
      )}

      {/* Create Note Modal */}
      {isNoteEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsNoteEditorOpen(false)}
              className="absolute top-5 right-5 text-foreground-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <NoteEditor
              sessionId={session.id}
              onSuccess={() => {
                setIsNoteEditorOpen(false);
                fetchSessionData();
              }}
              onCancel={() => setIsNoteEditorOpen(false)}
            />
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {isFileUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsFileUploadOpen(false)}
              className="absolute top-5 right-5 text-foreground-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <FileUpload
              sessionId={session.id}
              onSuccess={() => {
                setIsFileUploadOpen(false);
                fetchSessionData();
              }}
              onCancel={() => setIsFileUploadOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
