import React, { useState, useEffect } from 'react';
import type { LearningSessionDto, ProposeRescheduleInput } from '@peerlume/shared';
import { apiService } from '../../services/api.js';
import { Button } from '../ui/Button.js';
import { Alert } from '../ui/Alert.js';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';

interface RescheduleDialogProps {
  session: LearningSessionDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  session,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [date, setDate] = useState(() => {
    const d = new Date(session.startTime);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [reason, setReason] = useState('');

  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check conflicts
  useEffect(() => {
    if (!date || !startTime) return;
    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endTimestamp = new Date(`${date}T${startTime}:00`).getTime() + durationMinutes * 60 * 1000;
      const endIso = new Date(endTimestamp).toISOString();

      apiService.sessions
        .checkAvailability(startIso, endIso, session.id)
        .then((res) => {
          if (res.data?.hasConflict) {
            setHasConflict(true);
            setConflictMessage(`Overlaps with another scheduled session.`);
          } else {
            setHasConflict(false);
            setConflictMessage(null);
          }
        })
        .catch(() => {});
    } catch {
      // Invalid date parse
    }
  }, [date, startTime, durationMinutes, session.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const startDateTime = new Date(`${date}T${startTime}:00`);
    if (startDateTime.getTime() < Date.now()) {
      setError('Proposed reschedule time must be in the future');
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const input: ProposeRescheduleInput = {
      proposedStartTime: startDateTime.toISOString(),
      proposedEndTime: endDateTime.toISOString(),
      proposedTimeZone: session.timeZone,
      reason: reason.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const res = await apiService.sessions.proposeReschedule(session.id, input);
      if (res.error) {
        setError(res.error);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit reschedule proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground-muted hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-surface border border-border text-foreground">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Propose Reschedule</h3>
            <p className="text-xs text-foreground-muted">
              For "{session.title}" • Original schedule stays active until accepted.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {hasConflict && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3 text-amber-700 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <span className="font-semibold">Conflict: </span>
              {conflictMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                New Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                New Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour (60m)</option>
              <option value={90}>1.5 hours (90m)</option>
              <option value={120}>2 hours (120m)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Reason for Rescheduling
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Unexpected lab exam, conflict with office hours..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg p-2.5 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              Send Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
