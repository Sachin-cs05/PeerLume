import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Button } from '../../components/ui/Button.js';
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
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-foreground-secondary font-semibold text-xs mb-1.5 px-3 py-1 rounded-full bg-surface border border-border w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collaborative Code Editor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Collaborative Code Workspaces</h1>
            <p className="text-foreground-secondary text-sm mt-1">
              Write, debug, and learn code together with live CRDT synchronization and syntax highlighting.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Coding Workspace
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search workspaces by title, description or session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border self-start sm:self-auto text-xs">
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
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workspaces List / Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-foreground-muted gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
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
                  className="group bg-card border border-border hover:border-foreground-muted/40 rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface text-foreground-secondary border border-border">
                        {primaryDoc?.language || 'typescript'}
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          isOwner
                            ? 'bg-surface-elevated text-foreground border-border'
                            : 'bg-surface text-foreground-secondary border-border-subtle'
                        }`}
                      >
                        {isOwner ? 'Owner' : ws.currentRole || 'Editor'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-foreground group-hover:underline transition-colors line-clamp-1">
                        {ws.title}
                      </h3>
                      {ws.description && (
                        <p className="text-xs text-foreground-secondary mt-1 line-clamp-2 leading-relaxed">
                          {ws.description}
                        </p>
                      )}
                    </div>

                    {ws.sessionTitle && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface px-2.5 py-1 rounded-md border border-border-subtle w-fit">
                        <Calendar className="w-3.5 h-3.5 text-foreground-muted" />
                        <span className="line-clamp-1">Session: {ws.sessionTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
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

                    <div className="text-foreground-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
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
            <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-foreground">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-foreground-muted hover:text-foreground p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-foreground" />
                New Coding Workspace
              </h2>
              <p className="text-xs text-foreground-secondary mb-5">
                Set up an interactive, collaborative coding environment with your peers.
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Workspace Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dynamic Programming Practice, React Hooks Deep Dive"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Objectives or notes for this coding session..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:border-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Initial Language
                    </label>
                    <select
                      value={createLanguage}
                      onChange={(e) => setCreateLanguage(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Link Learning Session (Optional)
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground cursor-pointer"
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
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Invite Collaborators (Optional)
                  </label>
                  {friends.length === 0 ? (
                    <p className="text-xs text-foreground-muted italic">
                      No connected learning partners found. You can invite friends later via workspace link.
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1 bg-surface p-2 rounded-lg border border-border divide-y divide-border-subtle">
                      {friends.map((f) => {
                        const isSelected = selectedCollabIds.includes(f.friendId);
                        return (
                          <div
                            key={f.id}
                            onClick={() => toggleCollaborator(f.friendId)}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                              isSelected ? 'bg-surface-elevated font-semibold text-foreground' : 'hover:bg-surface-hover text-foreground-secondary'
                            }`}
                          >
                            <span>{f.student?.fullName || 'Peer'}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-foreground rounded"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!createTitle.trim()}
                  >
                    Create & Open Editor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
