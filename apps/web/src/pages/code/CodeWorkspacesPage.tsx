import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Code2,
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@peerlume/shared';
import type {
  CodeWorkspaceDto,
  CreateCodeWorkspaceInput,
  LearningSessionDto,
  FriendConnectionDto,
} from '@peerlume/shared';

export const CodeWorkspacesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<CodeWorkspaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'sessions'>('all');

  // New Workspace Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createLanguage, setCreateLanguage] = useState('typescript');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedCollabIds, setSelectedCollabIds] = useState<string[]>([]);

  // Metadata for create modal
  const [sessions, setSessions] = useState<LearningSessionDto[]>([]);
  const [friends, setFriends] = useState<FriendConnectionDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.codeWorkspaces.list();
      if (res.data) {
        setWorkspaces(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleOpenCreateModal = async () => {
    setShowCreateModal(true);
    try {
      const [sessionsRes, friendsRes] = await Promise.all([
        api.sessions.list({ period: 'upcoming' }),
        api.connections.getFriends(),
      ]);
      if (sessionsRes.data) {
        setSessions(sessionsRes.data.filter((s: LearningSessionDto) => s.status === 'ACCEPTED'));
      }
      if (friendsRes.data) {
        setFriends(friendsRes.data);
      }
    } catch (err) {
      console.error('Error fetching metadata for modal:', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const input: CreateCodeWorkspaceInput = {
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        initialLanguage: createLanguage,
        sessionId: selectedSessionId || undefined,
        collaboratorIds: selectedCollabIds.length > 0 ? selectedCollabIds : undefined,
      };

      const res = await api.codeWorkspaces.create(input);
      if (res.data) {
        setShowCreateModal(false);
        navigate(`/code/${res.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCollaborator = (id: string) => {
    setSelectedCollabIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredWorkspaces = workspaces.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.sessionTitle && w.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'mine') {
      return w.creatorId === user?.id;
    }
    if (activeFilter === 'sessions') {
      return Boolean(w.sessionId);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Collaborative Code Editor</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Collaborative Code Workspaces</h1>
            <p className="text-slate-400 text-sm mt-1">
              Write, debug, and learn code together with live CRDT synchronization and syntax highlighting.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Coding Workspace</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workspaces by title, description or session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All Workspaces' },
                { id: 'mine', label: 'Created by Me' },
                { id: 'sessions', label: 'Session Linked' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workspaces List / Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading your coding workspaces...</p>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <EmptyState
            icon={<Code2 className="w-8 h-8" />}
            title="No Workspaces Found"
            description={
              searchQuery
                ? 'No workspaces matched your search criteria.'
                : 'You have not created or joined any collaborative code workspaces yet.'
            }
            action={{
              label: 'Create First Workspace',
              icon: <Plus className="w-4 h-4" />,
              onClick: handleOpenCreateModal,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkspaces.map((ws) => {
              const primaryDoc = ws.documents[0];
              const isOwner = ws.creatorId === user?.id;

              return (
                <div
                  key={ws.id}
                  onClick={() => navigate(`/code/${ws.id}`)}
                  className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {primaryDoc?.language || 'typescript'}
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isOwner
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isOwner ? 'Owner' : ws.currentRole || 'Editor'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {ws.title}
                      </h3>
                      {ws.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {ws.description}
                        </p>
                      )}
                    </div>

                    {ws.sessionTitle && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 w-fit">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">Session: {ws.sessionTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Collaborators">
                        <Users className="w-3.5 h-3.5" />
                        {ws.participants.length}
                      </span>
                      <span className="flex items-center gap-1" title="Documents">
                        <Code2 className="w-3.5 h-3.5" />
                        {ws.documents.length}
                      </span>
                      <span className="flex items-center gap-1" title="Last updated">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ws.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                New Coding Workspace
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Set up an interactive, collaborative coding environment with your peers.
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Workspace Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dynamic Programming Practice, React Hooks Deep Dive"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Objectives or notes for this coding session..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Initial Language
                    </label>
                    <select
                      value={createLanguage}
                      onChange={(e) => setCreateLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Link Learning Session (Optional)
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">None (Independent Workspace)</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Invite Collaborators from Connections */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Invite Collaborators (Optional)
                  </label>
                  {friends.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      No connected learning partners found. You can invite friends later via workspace link.
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800 divide-y divide-slate-800/40">
                      {friends.map((f) => {
                        const isSelected = selectedCollabIds.includes(f.friendId);
                        return (
                          <div
                            key={f.id}
                            onClick={() => toggleCollaborator(f.friendId)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                              isSelected ? 'bg-indigo-600/10 text-indigo-300' : 'hover:bg-slate-900 text-slate-300'
                            }`}
                          >
                            <span className="font-medium">{f.student?.fullName || 'Peer'}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-indigo-600 rounded"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !createTitle.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create & Open Editor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
