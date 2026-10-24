import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type {
  FriendConnectionDto,
  FriendRequestDto,
  SavedPartnerDto,
  UserBlockDto,
  StudentSearchItem,
} from '@peerlume/shared';
import {
  Users,
  UserPlus,
  Bookmark,
  ShieldAlert,
  Search,
  Check,
  X,
  MessageSquare,
  UserMinus,
  ExternalLink,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { StudentProfileModal } from '../../components/connections/StudentProfileModal.js';
import { api } from '../../services/api.js';

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'saved' | 'blocked'>('friends');
  const [requestsSubTab, setRequestsSubTab] = useState<'incoming' | 'outgoing'>('incoming');

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [friends, setFriends] = useState<FriendConnectionDto[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestDto[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestDto[]>([]);
  const [savedPartners, setSavedPartners] = useState<SavedPartnerDto[]>([]);
  const [blockedStudents, setBlockedStudents] = useState<UserBlockDto[]>([]);

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchItem | null>(null);
  const [unfriendConfirmId, setUnfriendConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTabContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (activeTab === 'friends') {
      const res = await api.connections.getFriends(searchQuery || undefined);
      setLoading(false);
      if (res.error) setError(res.error);
      else if (res.data) setFriends(res.data);
    } else if (activeTab === 'requests') {
      const [inRes, outRes] = await Promise.all([
        api.connections.getIncomingRequests(),
        api.connections.getOutgoingRequests(),
      ]);
      setLoading(false);
      if (inRes.data) setIncomingRequests(inRes.data);
      if (outRes.data) setOutgoingRequests(outRes.data);
    } else if (activeTab === 'saved') {
      const res = await api.savedPartners.getSavedPartners();
      setLoading(false);
      if (res.error) setError(res.error);
      else if (res.data) setSavedPartners(res.data);
    } else if (activeTab === 'blocked') {
      const res = await api.blocks.getBlockedStudents();
      setLoading(false);
      if (res.error) setError(res.error);
      else if (res.data) setBlockedStudents(res.data);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchTabContent();
  }, [fetchTabContent]);

  // Request actions
  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(true);
    const res = await api.connections.acceptRequest(requestId);
    setActionLoading(false);
    if (!res.error) {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
      fetchTabContent();
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setActionLoading(true);
    const res = await api.connections.declineRequest(requestId);
    setActionLoading(false);
    if (!res.error) {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  const handleCancelOutgoing = async (requestId: string) => {
    setActionLoading(true);
    const res = await api.connections.cancelRequest(requestId);
    setActionLoading(false);
    if (!res.error) {
      setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  const handleRemoveFriend = async (connectionId: string) => {
    setActionLoading(true);
    const res = await api.connections.removeFriend(connectionId);
    setActionLoading(false);
    setUnfriendConfirmId(null);
    if (!res.error) {
      setFriends((prev) => prev.filter((f) => f.id !== connectionId));
    }
  };

  const handleRemoveSaved = async (studentId: string) => {
    setActionLoading(true);
    const res = await api.savedPartners.removeSavedPartner(studentId);
    setActionLoading(false);
    if (!res.error) {
      setSavedPartners((prev) => prev.filter((s) => s.savedStudentId !== studentId));
    }
  };

  const handleUnblock = async (studentId: string) => {
    setActionLoading(true);
    const res = await api.blocks.unblockStudent(studentId);
    setActionLoading(false);
    if (!res.error) {
      setBlockedStudents((prev) => prev.filter((b) => b.blockedId !== studentId));
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Friends &amp; Connections
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1 font-normal">
              Manage your peer learning network, study circles, and connection requests.
            </p>
          </div>

          <button
            onClick={fetchTabContent}
            disabled={loading}
            className="self-start sm:self-auto p-2 rounded-lg bg-card border border-border text-foreground-muted hover:text-foreground shadow-xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-card border border-rose-500/30 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-1 scrollbar-none border-b border-border gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friends</span>
            {friends.length > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-background text-foreground font-bold">
                {friends.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Connection Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-background text-foreground font-bold">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Partners</span>
            {savedPartners.length > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-background text-foreground font-bold">
                {savedPartners.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === 'blocked'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Blocked</span>
          </button>
        </div>

        {/* Tab 1: Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-5">
            {/* Search Friends */}
            <div className="relative max-w-md">
              <Search className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search within your connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-card border border-border text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground transition-colors shadow-2xs"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-card rounded-xl p-5 h-44 border border-border shadow-xs" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <EmptyState
                icon={<Users className="w-6 h-6" />}
                title="No friends yet"
                description="Find a study partner in Discover with mutual skills and learning goals."
                action={{
                  label: 'Find Study Partners',
                  href: '/discover',
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {friends.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border hover:border-border-strong rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-foreground font-bold text-sm shrink-0">
                            {item.student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-sm">{item.student.fullName}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                              <GraduationCap className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                              <span className="truncate max-w-[150px]">{item.student.college}</span>
                            </div>
                            <div className="text-[11px] text-foreground-muted">
                              {item.student.branch} • {item.student.semester}
                            </div>
                          </div>
                        </div>

                        {/* Chat Entry Point */}
                        <button
                          type="button"
                          onClick={() => navigate(`/chat?userId=${item.student.id}`)}
                          className="p-2 rounded-lg bg-background hover:bg-surface-hover border border-border text-foreground transition-all cursor-pointer"
                          title="Message student"
                          aria-label="Message student"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Skills Preview */}
                      <div className="space-y-1.5 mb-3 text-xs">
                        <span className="text-[10px] text-foreground-muted font-semibold uppercase tracking-wider block">
                          Teaches
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.student.teachingSkills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-hover text-foreground border border-border"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(item.student)}
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Profile
                      </Button>

                      {unfriendConfirmId === item.id ? (
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={actionLoading}
                            onClick={() => handleRemoveFriend(item.id)}
                            className="text-xs px-2 py-1"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUnfriendConfirmId(null)}
                            className="text-xs px-2 py-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUnfriendConfirmId(item.id)}
                          leftIcon={<UserMinus className="w-3.5 h-3.5" />}
                          className="text-xs text-foreground-muted hover:text-rose-500"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests (Incoming & Outgoing) */}
        {activeTab === 'requests' && (
          <div className="space-y-5">
            <div className="flex gap-2 border-b border-border pb-2">
              <button
                onClick={() => setRequestsSubTab('incoming')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  requestsSubTab === 'incoming'
                    ? 'bg-surface-hover text-foreground border border-border'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                Incoming ({incomingRequests.length})
              </button>
              <button
                onClick={() => setRequestsSubTab('outgoing')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  requestsSubTab === 'outgoing'
                    ? 'bg-surface-hover text-foreground border border-border'
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                Outgoing ({outgoingRequests.length})
              </button>
            </div>

            {requestsSubTab === 'incoming' ? (
              incomingRequests.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="w-6 h-6" />}
                  title="No incoming requests"
                  description="You have no pending requests. Connect with study partners in Discover to start collaborating."
                  action={{
                    label: 'Explore Partners',
                    href: '/discover',
                    variant: 'outline',
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-foreground text-xs">
                          {req.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-xs sm:text-sm">{req.sender.fullName}</h4>
                          <span className="text-xs text-foreground-muted block truncate max-w-[160px]">
                            {req.sender.college}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-foreground-secondary">
                        <span className="text-foreground-muted block mb-1">Teaches:</span>
                        <div className="flex flex-wrap gap-1">
                          {req.sender.teachingSkills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-surface-hover border border-border text-foreground text-[10px] font-medium"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={actionLoading}
                          onClick={() => handleDeclineRequest(req.id)}
                          className="text-xs"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={actionLoading}
                          onClick={() => handleAcceptRequest(req.id)}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : outgoingRequests.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="w-6 h-6" />}
                title="No outgoing requests"
                description="You haven't sent any friend requests yet. Discover students by skill or campus to connect."
                action={{
                  label: 'Discover Partners',
                  href: '/discover',
                  variant: 'outline',
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-foreground text-xs">
                        {req.receiver.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-xs sm:text-sm">{req.receiver.fullName}</h4>
                        <span className="text-xs text-foreground-muted block truncate max-w-[150px]">
                          {req.receiver.college}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={actionLoading}
                      onClick={() => handleCancelOutgoing(req.id)}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Partners */}
        {activeTab === 'saved' && (
          <div className="space-y-5">
            {savedPartners.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-6 h-6" />}
                title="No saved learning partners"
                description="Bookmark students on the Discover page to save them for quick reference later."
                action={{
                  label: 'Discover Students',
                  href: '/discover',
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedPartners.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center font-bold text-foreground text-xs">
                          {item.student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-xs sm:text-sm">{item.student.fullName}</h4>
                          <span className="text-xs text-foreground-muted block truncate max-w-[160px]">
                            {item.student.college}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-foreground-secondary italic bg-background p-2.5 rounded-lg border border-border mb-3">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(item.student)}
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={actionLoading}
                        onClick={() => handleRemoveSaved(item.savedStudentId)}
                        className="text-xs text-foreground-muted hover:text-rose-500"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Blocked Students */}
        {activeTab === 'blocked' && (
          <div className="space-y-5">
            {blockedStudents.length === 0 ? (
              <EmptyState
                icon={<ShieldAlert className="w-6 h-6" />}
                title="No blocked students"
                description="You haven't blocked anyone. Students you block will not be able to connect or message you."
              />
            ) : (
              <div className="max-w-2xl space-y-2.5">
                {blockedStudents.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {item.blockedStudent.fullName}
                      </span>
                      <span className="text-xs text-foreground-muted block">
                        Blocked on {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.reason && (
                        <span className="text-[11px] text-foreground-secondary block italic">
                          Reason: {item.reason}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={actionLoading}
                      onClick={() => handleUnblock(item.blockedId)}
                      className="text-xs"
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          onActionComplete={fetchTabContent}
        />
      )}
    </div>
  );
};
