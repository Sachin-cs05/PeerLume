import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import type { StudyRoomDto, LearningSessionDto, FriendConnectionDto } from '@peerlume/shared';
import {
  Presentation,
  Plus,
  Search,
  Users,
  Calendar,
  ArrowRight,
  Radio,
  X,
  Check,
} from 'lucide-react';

export const StudyRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<StudyRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Create Modal State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [sessions, setSessions] = useState<LearningSessionDto[]>([]);
  const [friends, setFriends] = useState<FriendConnectionDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchRooms = () => {
    setLoading(true);
    apiService.studyRooms
      .list({ activeOnly: false })
      .then((res) => {
        if (res.data) setRooms(res.data.rooms);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setTitle('');
    setTopic('');
    setDescription('');
    setSelectedSessionId('');
    setSelectedInvitees([]);
    setCreateError(null);
    setCreateModalOpen(true);

    // Fetch user sessions and friends for selection
    apiService.sessions.list({ status: 'ACCEPTED' }).then((res) => {
      if (res.data) setSessions(res.data);
    });

    apiService.connections.getFriends().then((res) => {
      if (res.data) setFriends(res.data);
    });
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      setCreateError('Title and topic are required');
      return;
    }

    setSubmitting(true);
    setCreateError(null);

    const res = await apiService.studyRooms.create({
      title: title.trim(),
      topic: topic.trim(),
      description: description.trim() || undefined,
      sessionId: selectedSessionId || undefined,
      inviteeIds: selectedInvitees,
    });

    setSubmitting(false);

    if (res.data) {
      setCreateModalOpen(false);
      navigate(`/study-rooms/${res.data.id}`);
    } else {
      setCreateError(res.error || 'Failed to create study room');
    }
  };

  const toggleInvitee = (friendId: string) => {
    setSelectedInvitees((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground-secondary bg-surface px-2.5 py-0.5 rounded-full border border-border">
              Interactive Study Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Collaborative Study Rooms
          </h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Learn together in real time with synchronized whiteboards, voice & video, and session notes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Room</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-foreground-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms by title or topic..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-foreground-secondary self-end sm:self-auto">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-foreground animate-pulse" />
            <strong className="text-foreground">
              {rooms.filter((r) => r.isActive).length}
            </strong> Active Rooms
          </span>
          <span className="text-border-strong">•</span>
          <span>
            <strong className="text-foreground">{rooms.length}</strong> Total Rooms
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-surface animate-pulse border border-border" />
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group flex flex-col justify-between p-5 bg-card border border-border hover:border-border-strong rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${room.isActive
                      ? 'bg-surface text-foreground border border-border'
                      : 'bg-surface text-foreground-muted border border-border-subtle'
                    }`}>
                    {room.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />}
                    <span>{room.isActive ? 'Active Room' : 'Ended'}</span>
                  </span>

                  {room.session && (
                    <span className="text-[10px] font-medium text-foreground-secondary flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-foreground" />
                      <span>Linked Session</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-foreground group-hover:text-foreground transition-colors line-clamp-1">
                  {room.title}
                </h3>
                <p className="text-xs font-medium text-foreground-secondary mt-1 line-clamp-1">
                  {room.topic}
                </p>

                {room.description && (
                  <p className="text-xs text-foreground-muted mt-2 line-clamp-2">
                    {room.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <Users className="w-3.5 h-3.5" />
                  <span>{room.participants?.length || 1} participant{room.participants?.length === 1 ? '' : 's'}</span>
                </div>

                <Link
                  to={`/study-rooms/${room.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-foreground group-hover:translate-x-1 transition-transform duration-150"
                >
                  <span>Enter Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Presentation className="w-8 h-8" />}
          title="No study rooms found"
          description={
            search
              ? 'No rooms match your search query.'
              : 'Create your first collaborative study room to start working on the whiteboard together.'
          }
          action={{
            label: 'Create Study Room',
            icon: <Plus className="w-4 h-4" />,
            onClick: openCreateModal,
          }}
        />
      )}

      {/* Create Study Room Modal */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Study Room"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden text-foreground max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Presentation className="w-5 h-5 text-foreground" />
                <h2 className="text-base font-semibold">Create Study Room</h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-4 overflow-y-auto space-y-4">
              {createError && (
                <div className="p-3 text-xs text-foreground bg-surface border border-border rounded-xl">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Room Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Quantum Mechanics Review"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Topic / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Wave-Particle Duality & Schrödinger Equation"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline topics or problems to solve during this study session..."
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Associate with Learning Session */}
              {sessions.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Link to Learning Session (Optional)
                  </label>
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">No linked session</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({new Date(s.startTime).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Invite Friends */}
              {friends.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Invite Collaborators (Friends)
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-surface rounded-xl border border-border">
                    {friends.map((f) => {
                      const friendUser = f.student;
                      const isSelected = selectedInvitees.includes(f.friendId);
                      return (
                        <div
                          key={f.id}
                          onClick={() => toggleInvitee(f.friendId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${isSelected
                              ? 'bg-card border border-border-strong text-foreground font-medium'
                              : 'hover:bg-surface-hover text-foreground-secondary'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                              {friendUser.fullName.charAt(0)}
                            </div>
                            <span>{friendUser.fullName}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-foreground" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-border text-foreground hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Create & Enter Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
