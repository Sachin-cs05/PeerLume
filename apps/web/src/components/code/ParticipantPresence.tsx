import React, { useState, useEffect } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import type { CodeWorkspaceParticipantDto, WorkspaceRole, FriendConnectionDto } from '@peerlume/shared';
import { api } from '../../services/api';
import type { Awareness } from 'y-protocols/awareness';

interface ParticipantPresenceProps {
  workspaceId: string;
  participants: CodeWorkspaceParticipantDto[];
  awareness: Awareness | null;
  currentUserId: string;
  isOwner: boolean;
  onParticipantAdded: (newParticipant: CodeWorkspaceParticipantDto) => void;
  onRoleChanged?: (userId: string, newRole: WorkspaceRole) => void;
  onParticipantRemoved?: (userId: string) => void;
}

export const ParticipantPresence: React.FC<ParticipantPresenceProps> = ({
  workspaceId,
  participants,
  awareness,
  currentUserId,
  isOwner,
  onParticipantAdded,
}) => {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set([currentUserId]));
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friends, setFriends] = useState<FriendConnectionDto[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('EDITOR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track active awareness presence
  useEffect(() => {
    if (!awareness) return;

    const updateOnline = () => {
      const states = awareness.getStates();
      const userIds = new Set<string>();
      states.forEach((state) => {
        if (state.user && state.user.id) {
          userIds.add(state.user.id);
        }
      });
      // Always include current user
      userIds.add(currentUserId);
      setOnlineUserIds(userIds);
    };

    awareness.on('change', updateOnline);
    updateOnline();

    return () => {
      awareness.off('change', updateOnline);
    };
  }, [awareness, currentUserId]);

  const handleOpenInvite = async () => {
    setShowInviteModal(true);
    setLoadingFriends(true);
    try {
      const res = await api.connections.getFriends();
      if (res.data) {
        // Filter out already participating friends
        const existingIds = new Set(participants.map((p) => p.userId));
        const eligible = res.data.filter((f: FriendConnectionDto) => !existingIds.has(f.friendId));
        setFriends(eligible);
        if (eligible.length > 0) {
          setSelectedFriendId(eligible[0].friendId);
        }
      }
    } catch (err) {
      console.error('Error fetching friends for invite:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriendId) return;

    setIsSubmitting(true);
    try {
      const res = await api.codeWorkspaces.addParticipant(workspaceId, {
        userId: selectedFriendId,
        role: selectedRole,
      });

      if (res.data) {
        onParticipantAdded(res.data);
        setShowInviteModal(false);
      }
    } catch (err) {
      console.error('Error adding participant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Presence Avatars */}
      <div className="flex items-center -space-x-2 overflow-hidden py-1">
        {participants.slice(0, 5).map((p) => {
          const isOnline = onlineUserIds.has(p.userId);
          const initial = p.fullName ? p.fullName.charAt(0).toUpperCase() : 'U';

          return (
            <div
              key={p.id}
              className="relative group cursor-pointer"
              title={`${p.fullName} (${p.role}) - ${isOnline ? 'Active Now' : 'Offline'}`}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-xs transition-transform group-hover:scale-110 ${
                  p.role === 'OWNER'
                    ? 'bg-foreground text-background'
                    : 'bg-surface border border-border text-foreground-secondary'
                }`}
              >
                {initial}
              </div>

              {/* Online Indicator */}
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-background ${
                  isOnline ? 'bg-emerald-500' : 'bg-zinc-500'
                }`}
              />
            </div>
          );
        })}
      </div>

      {participants.length > 5 && (
        <span className="text-[11px] text-foreground-muted font-medium">+{participants.length - 5}</span>
      )}

      {/* Invite Button (Owner only) */}
      {isOwner && (
        <button
          onClick={handleOpenInvite}
          className="p-1.5 text-foreground-muted hover:text-foreground bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors text-xs flex items-center gap-1"
          title="Invite collaborator"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-xs">Invite</span>
        </button>
      )}

      {/* Invite Collaborator Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-foreground">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-foreground-muted hover:text-foreground p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-foreground" />
              Invite Collaborator
            </h3>
            <p className="text-xs text-foreground-secondary mb-4">
              Collaborate on code in real time with mutual friends and learning partners.
            </p>

            {loadingFriends ? (
              <div className="py-8 text-center text-foreground-muted text-xs">Loading your connections...</div>
            ) : friends.length === 0 ? (
              <div className="py-6 text-center text-foreground-muted text-xs bg-surface rounded-xl border border-border">
                All your eligible connections are already participating in this workspace.
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Select Peer
                  </label>
                  <select
                    value={selectedFriendId}
                    onChange={(e) => setSelectedFriendId(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-foreground cursor-pointer"
                  >
                    {friends.map((f) => (
                      <option key={f.id} value={f.friendId}>
                        {f.student?.fullName || 'Peer'} ({f.student?.college || 'Student'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Permissions Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('EDITOR')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === 'EDITOR'
                          ? 'bg-surface-elevated border-foreground text-foreground font-semibold'
                          : 'bg-surface border-border text-foreground-secondary hover:border-foreground-muted'
                      }`}
                    >
                      <div className="text-sm">Editor</div>
                      <div className="text-xs opacity-75 mt-0.5">Can edit code & create files</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('VIEWER')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === 'VIEWER'
                          ? 'bg-surface-elevated border-foreground text-foreground font-semibold'
                          : 'bg-surface border-border text-foreground-secondary hover:border-foreground-muted'
                      }`}
                    >
                      <div className="text-sm">Viewer</div>
                      <div className="text-xs opacity-75 mt-0.5">Read-only code inspection</div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs font-medium text-foreground-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedFriendId}
                    className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {isSubmitting ? 'Inviting...' : 'Add to Workspace'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
