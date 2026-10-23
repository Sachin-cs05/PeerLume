import React, { useState, useEffect } from 'react';
import type { CreateSessionInput, FriendConnectionDto } from '@peerlume/shared';
import { apiService } from '../../services/api.js';
import { Button } from '../ui/Button.js';
import { Alert } from '../ui/Alert.js';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface SessionFormProps {
  initialInviteeId?: string;
  onSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  initialInviteeId,
  onSuccess,
  onCancel,
}) => {
  const [friends, setFriends] = useState<FriendConnectionDto[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeZone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [mode, setMode] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [location, setLocation] = useState('');
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>(
    initialInviteeId ? [initialInviteeId] : []
  );
  const [notes, setNotes] = useState('');

  // Conflict Detection State
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch eligible friends for invitations
  useEffect(() => {
    let mounted = true;
    apiService.connections
      .getFriends()
      .then((res) => {
        if (mounted && res.data) {
          setFriends(res.data);
        }
      })
      .finally(() => {
        if (mounted) setLoadingFriends(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Conflict detection whenever date, time or duration changes
  useEffect(() => {
    if (!date || !startTime) return;

    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endTimestamp = new Date(`${date}T${startTime}:00`).getTime() + durationMinutes * 60 * 1000;
      const endIso = new Date(endTimestamp).toISOString();

      apiService.sessions
        .checkAvailability(startIso, endIso)
        .then((res) => {
          if (res.data?.hasConflict) {
            setHasConflict(true);
            const count = res.data.conflictingSessions.length;
            setConflictMessage(
              `You have ${count} overlapping session${count > 1 ? 's' : ''} during this time (${res.data.conflictingSessions[0]?.title}).`
            );
          } else {
            setHasConflict(false);
            setConflictMessage(null);
          }
        });
    } catch {
      // Invalid date parse
    }
  }, [date, startTime, durationMinutes]);

  const handleToggleInvitee = (id: string) => {
    setSelectedInvitees((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Session title is required');
      return;
    }
    if (!topic.trim()) {
      setError('Topic or subject is required');
      return;
    }
    if (selectedInvitees.length === 0) {
      setError('Please select at least one learning partner to invite');
      return;
    }
    if (mode === 'IN_PERSON' && !location.trim()) {
      setError('Location is required for in-person sessions');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    if (startDateTime.getTime() < Date.now()) {
      setError('Session start time cannot be in the past');
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const input: CreateSessionInput = {
      title: title.trim(),
      topic: topic.trim(),
      description: description.trim() || undefined,
      objectives: objectives.trim() || undefined,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      timeZone,
      mode,
      location: mode === 'IN_PERSON' ? location.trim() : undefined,
      inviteeIds: selectedInvitees,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const res = await apiService.sessions.create(input);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) {
        onSuccess(res.data.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" title="Could not create session">
          {error}
        </Alert>
      )}

      {hasConflict && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-3 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">Schedule Conflict Warning: </span>
            {conflictMessage} You can still schedule if you wish.
          </div>
        </div>
      )}

      {/* Title & Topic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Session Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Graph Algorithms Practice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Topic or Subject *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Computer Science, Calculus, UI Design"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Description & Learning Objectives */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="What will you work on together?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Learning Objectives & Goals
          </label>
          <input
            type="text"
            placeholder="e.g., Solve 3 LeetCode Mediums on DFS/BFS"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Date, Time, Duration, Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-850">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span>Date *</span>
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>Start Time *</span>
          </label>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Duration
          </label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour (60m)</option>
            <option value={90}>1.5 hours (90m)</option>
            <option value={120}>2 hours (120m)</option>
            <option value={180}>3 hours (180m)</option>
          </select>
        </div>
      </div>

      {/* Mode & Location */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Session Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('ONLINE')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
              mode === 'ONLINE'
                ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>Online Call (WebRTC)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('IN_PERSON')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
              mode === 'IN_PERSON'
                ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4 text-purple-400" />
            <span>In-Person Meetup</span>
          </button>
        </div>

        {mode === 'IN_PERSON' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Campus or Public Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Campus Library Study Room 3B"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Invitee Selector from Connected Friends */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Invite Learning Partners *</span>
          <span className="text-[11px] text-slate-400 font-normal">
            {selectedInvitees.length} selected
          </span>
        </label>

        {loadingFriends ? (
          <div className="text-xs text-slate-400 py-3 text-center">Loading connections...</div>
        ) : friends.length === 0 ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
            No connected learning partners found. Connect with friends or discover partners first!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {friends.map((friend) => {
              const isSelected = selectedInvitees.includes(friend.friendId);
              return (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => handleToggleInvitee(friend.friendId)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/60 text-white'
                      : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-750'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {friend.student?.fullName ? friend.student.fullName.charAt(0) : 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">
                      {friend.student?.fullName || 'Learning Partner'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {friend.student?.college || 'Student'}
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <span className="text-[10px] leading-none">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Preparation Notes or Materials
        </label>
        <textarea
          rows={2}
          placeholder="Links, chapters to review, or software to install beforehand..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={submitting}>
          Create & Send Invitations
        </Button>
      </div>
    </form>
  );
};
