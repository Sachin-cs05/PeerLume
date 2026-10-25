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
    <div className="bg-card border border-border rounded-xl p-5 hover:border-border-strong hover:shadow-md hover:-translate-y-1 transition-all duration-200 shadow-xs flex flex-col justify-between gap-4 group">
      {/* Header: Title, Topic, Status Badge */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface border border-border text-foreground-secondary mb-1.5">
              {session.topic}
            </span>
            <h3 className="text-base font-semibold text-foreground hover:underline transition-colors">
              <Link to={`/sessions/${session.id}`}>{session.title}</Link>
            </h3>
          </div>
          <SessionStatusBadge status={session.status} size="sm" />
        </div>

        {session.description && (
          <p className="text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        )}
      </div>

      {/* Date, Time, Mode, Location details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground-secondary bg-surface p-3 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
          <span>
            {formattedTime} ({durationMinutes}m)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {session.mode === 'ONLINE' ? (
            <>
              <Video className="w-3.5 h-3.5 text-foreground-secondary shrink-0" />
              <span className="font-medium text-foreground">Online Call</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-foreground-secondary shrink-0" />
              <span className="truncate">{session.location || 'In-Person'}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-foreground-muted">
          <Users className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
          <span>
            {session.participants.length} participant{session.participants.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Participants & Organizer preview */}
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div
              className="inline-block h-6 w-6 rounded-full ring-2 ring-card bg-foreground flex items-center justify-center text-background text-[10px] font-bold"
              title={`Organizer: ${session.organizerName}`}
            >
              {session.organizerName.charAt(0)}
            </div>
            {otherParticipants.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-card bg-surface border border-border flex items-center justify-center text-foreground-secondary text-[10px] font-medium"
                title={`${p.fullName} (${p.status})`}
              >
                {p.fullName.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-foreground-muted truncate">
            {isOrganizer ? 'Organized by you' : `By ${session.organizerName}`}
          </span>
        </div>

        {session.resourcesCount && session.resourcesCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-foreground-muted bg-surface border border-border-subtle px-2 py-0.5 rounded-md">
            <FileText className="w-3 h-3 text-foreground-muted" />
            {session.resourcesCount} resource{session.resourcesCount === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
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
