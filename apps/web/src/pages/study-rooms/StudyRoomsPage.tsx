import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.js';
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
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
              Interactive Study Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Collaborative Study Rooms
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Learn together in real time with synchronized whiteboards, voice & video, and session notes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:shadow-brand-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Room</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms by title or topic..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <strong className="text-slate-800 dark:text-slate-200">
              {rooms.filter((r) => r.isActive).length}
            </strong> Active Rooms
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-800 dark:text-slate-200">{rooms.length}</strong> Total Rooms
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                    room.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {room.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    <span>{room.isActive ? 'Active Room' : 'Ended'}</span>
                  </span>

                  {room.session && (
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-500" />
                      <span>Linked Session</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">
                  {room.title}
                </h3>
                <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-1 line-clamp-1">
                  {room.topic}
                </p>

                {room.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {room.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{room.participants?.length || 1} participant{room.participants?.length === 1 ? '' : 's'}</span>
                </div>

                <Link
                  to={`/study-rooms/${room.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Enter Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-500 flex items-center justify-center mx-auto mb-3">
            <Presentation className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No study rooms found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {search ? 'No rooms match your search query.' : 'Create your first collaborative study room to start working on the whiteboard together.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow-sm hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Study Room</span>
          </button>
        </div>
      )}

      {/* Create Study Room Modal */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Study Room"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Presentation className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-semibold">Create Study Room</h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-4 overflow-y-auto space-y-4">
              {createError && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Quantum Mechanics Review"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Wave-Particle Duality & Schrödinger Equation"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline topics or problems to solve during this study session..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Associate with Learning Session */}
              {sessions.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link to Learning Session (Optional)
                  </label>
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invite Collaborators (Friends)
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {friends.map((f) => {
                      const friendUser = f.student;
                      const isSelected = selectedInvitees.includes(f.friendId);
                      return (
                        <div
                          key={f.id}
                          onClick={() => toggleInvitee(f.friendId)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? 'bg-brand-50 dark:bg-brand-950/50 border border-brand-300 dark:border-brand-700 text-brand-900 dark:text-brand-100'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">
                              {friendUser.fullName.charAt(0)}
                            </div>
                            <span>{friendUser.fullName}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 shadow-sm"
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
