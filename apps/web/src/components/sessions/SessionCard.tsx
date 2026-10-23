import React from 'react';
import { Link } from 'react-router-dom';
import type { LearningSessionDto } from '@peerlume/shared';
import { SessionStatusBadge } from './SessionStatusBadge.js';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  Check,
  X,
  RefreshCw,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

interface SessionCardProps {
  session: LearningSessionDto;
  onAccept?: (sessionId: string) => void;
  onDecline?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onOpenReschedule?: (session: LearningSessionDto) => void;
  onComplete?: (sessionId: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onAccept,
  onDecline,
  onCancel,
  onOpenReschedule,
  onComplete,
}) => {
  const { user } = useAuth();
  const isOrganizer = user?.id === session.organizerId;
  const myParticipant = session.participants.find((p) => p.userId === user?.id);
  const isPendingInvitee = myParticipant?.role === 'INVITEE' && myParticipant?.status === 'PENDING';

  const startDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

  const formattedDate = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  const otherParticipants = session.participants.filter((p) => p.userId !== session.organizerId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 shadow-lg flex flex-col justify-between gap-4">
      {/* Header: Title, Topic, Status Badge */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-1.5">
              {session.topic}
            </span>
            <h3 className="text-lg font-bold text-white hover:text-brand-300 transition-colors">
              <Link to={`/sessions/${session.id}`}>{session.title}</Link>
            </h3>
          </div>
          <SessionStatusBadge status={session.status} size="sm" />
        </div>

        {session.description && (
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        )}
      </div>

      {/* Date, Time, Mode, Location details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-400 shrink-0" />
          <span>
            {formattedTime} ({durationMinutes}m)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {session.mode === 'ONLINE' ? (
            <>
              <Video className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-300">Online Call</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{session.location || 'In-Person Session'}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            {session.participants.length} participant
            {session.participants.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Participants & Organizer preview */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div
              className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-brand-600 flex items-center justify-center text-white text-[11px] font-bold"
              title={`Organizer: ${session.organizerName}`}
            >
              {session.organizerName.charAt(0)}
            </div>
            {otherParticipants.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-slate-700 flex items-center justify-center text-slate-200 text-[11px] font-medium"
                title={`${p.fullName} (${p.status})`}
              >
                {p.fullName.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {isOrganizer ? 'Organized by you' : `By ${session.organizerName}`}
          </span>
        </div>

        {session.resourcesCount && session.resourcesCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
            <FileText className="w-3 h-3 text-brand-400" />
            {session.resourcesCount} resource{session.resourcesCount === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <Link to={`/sessions/${session.id}`}>
          <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
            Details
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {/* Invitee Pending Acceptance Actions */}
          {isPendingInvitee && onAccept && onDecline && (
            <>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                onClick={() => onAccept(session.id)}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={() => onDecline(session.id)}
              >
                Decline
              </Button>
            </>
          )}

          {/* Online Call Button */}
          {session.status === 'ACCEPTED' && session.mode === 'ONLINE' && (
            <Link to={session.meetingUrl || `/chat?sessionTopic=${encodeURIComponent(session.topic)}`}>
              <Button variant="primary" size="sm" leftIcon={<Video className="w-3.5 h-3.5" />}>
                Join Call
              </Button>
            </Link>
          )}

          {/* Reschedule Button */}
          {['PENDING', 'ACCEPTED'].includes(session.status) && onOpenReschedule && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => onOpenReschedule(session)}
            >
              Reschedule
            </Button>
          )}

          {/* Mark Complete button for organizer */}
          {session.status === 'ACCEPTED' && isOrganizer && onComplete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onComplete(session.id)}
            >
              Finish
            </Button>
          )}

          {/* Cancel button */}
          {['PENDING', 'ACCEPTED', 'RESCHEDULE_REQUESTED'].includes(session.status) && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={() => onCancel(session.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
