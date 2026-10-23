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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Friends & Connections
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your peer learning network, study circles, and connection requests.
            </p>
          </div>

          <button
            onClick={fetchTabContent}
            disabled={loading}
            className="self-start sm:self-auto p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'friends'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
            {friends.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                {friends.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'requests'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Connection Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'saved'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Partners</span>
            {savedPartners.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                {savedPartners.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeTab === 'blocked'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Blocked</span>
          </button>
        </div>

        {/* Tab 1: Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-6">
            {/* Search Friends */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search within your connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-900 rounded-2xl p-5 h-48 border border-slate-800" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8" />}
                title="No friends yet"
                description="Find a study partner in Discover with mutual skills and learning goals."
                action={{
                  label: 'Find Study Partners',
                  href: '/discover',
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 p-0.5 shadow-md shrink-0">
                            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white font-bold text-base">
                              {item.student.fullName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">{item.student.fullName}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <GraduationCap className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{item.student.college}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {item.student.branch} • {item.student.semester}
                            </div>
                          </div>
                        </div>

                        {/* Chat Entry Point */}
                        <div className="relative group/chat">
                          <button
                            type="button"
                            onClick={() => navigate(`/chat?userId=${item.student.id}`)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-brand-600 border border-slate-700/60 hover:border-brand-500 text-slate-300 hover:text-white transition-all shadow-sm"
                            title="Message student"
                          >
                            <MessageSquare className="w-4 h-4 text-brand-400 group-hover/chat:text-white" />
                          </button>
                        </div>
                      </div>


                      {/* Skills Preview */}
                      <div className="space-y-2 mb-4 text-xs">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
                            Teaches
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.student.teachingSkills.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
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
                          leftIcon={<UserMinus className="w-3.5 h-3.5 text-rose-400" />}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
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
          <div className="space-y-6">
            <div className="flex gap-3 border-b border-slate-800 pb-2">
              <button
                onClick={() => setRequestsSubTab('incoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  requestsSubTab === 'incoming'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Incoming ({incomingRequests.length})
              </button>
              <button
                onClick={() => setRequestsSubTab('outgoing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  requestsSubTab === 'outgoing'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Outgoing ({outgoingRequests.length})
              </button>
            </div>

            {requestsSubTab === 'incoming' ? (
              incomingRequests.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="w-8 h-8" />}
                  title="No incoming requests"
                  description="You have no pending requests. Connect with study partners in Discover to start collaborating."
                  action={{
                    label: 'Explore Partners',
                    href: '/discover',
                    variant: 'outline',
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
                          {req.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{req.sender.fullName}</h4>
                          <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                            {req.sender.college}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-slate-400 block mb-1">Teaches:</span>
                        <div className="flex flex-wrap gap-1">
                          {req.sender.teachingSkills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px]"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={actionLoading}
                          onClick={() => handleDeclineRequest(req.id)}
                          className="text-xs text-rose-400 hover:bg-rose-950/30"
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
                icon={<UserPlus className="w-8 h-8" />}
                title="No outgoing requests"
                description="You haven't sent any friend requests yet. Discover students by skill or campus to connect."
                action={{
                  label: 'Discover Partners',
                  href: '/discover',
                  variant: 'outline',
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                        {req.receiver.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{req.receiver.fullName}</h4>
                        <span className="text-xs text-slate-400 block truncate max-w-[160px]">
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
          <div className="space-y-6">
            {savedPartners.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-8 h-8" />}
                title="No saved learning partners"
                description="Bookmark students on the Discover page to save them for quick reference later."
                action={{
                  label: 'Discover Students',
                  href: '/discover',
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPartners.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
                          {item.student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.student.fullName}</h4>
                          <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                            {item.student.college}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 mb-3">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
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
                        className="text-xs text-rose-400 hover:bg-rose-950/30"
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
          <div className="space-y-6">
            {blockedStudents.length === 0 ? (
              <EmptyState
                icon={<ShieldAlert className="w-8 h-8" />}
                title="No blocked students"
                description="You haven't blocked anyone. Students you block will not be able to connect or message you."
              />
            ) : (
              <div className="max-w-2xl space-y-3">
                {blockedStudents.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-white text-sm block">
                        {item.blockedStudent.fullName}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        Blocked on {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.reason && (
                        <span className="text-[11px] text-slate-500 block italic">
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
