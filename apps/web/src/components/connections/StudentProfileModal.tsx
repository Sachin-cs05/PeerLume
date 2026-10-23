import React, { useState } from 'react';
import type { StudentSearchItem } from '@peerlume/shared';
import {
  X,
  GraduationCap,
  BookOpen,
  Target,
  ShieldAlert,
  Bookmark,
  UserPlus,
  UserCheck,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { api } from '../../services/api.js';

interface StudentProfileModalProps {
  student: StudentSearchItem;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onActionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(student.connectionStatus);
  const [connectionRequestId, setConnectionRequestId] = useState(student.connectionRequestId);
  const [blockPromptOpen, setBlockPromptOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  if (!isOpen) return null;

  const handleSendRequest = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await api.connections.sendRequest(student.id);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setActionMessage('Connection request sent!');
      setConnectionStatus('REQUEST_SENT');
      onActionComplete?.();
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionRequestId) return;
    setLoading(true);
    setErrorMessage(null);
    const res = await api.connections.cancelRequest(connectionRequestId);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setActionMessage('Request cancelled');
      setConnectionStatus('NONE');
      setConnectionRequestId(undefined);
      onActionComplete?.();
    }
  };

  const handleAcceptRequest = async () => {
    if (!connectionRequestId) return;
    setLoading(true);
    setErrorMessage(null);
    const res = await api.connections.acceptRequest(connectionRequestId);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setActionMessage('You are now connected!');
      setConnectionStatus('FRIENDS');
      onActionComplete?.();
    }
  };

  const handleSavePartner = async () => {
    setLoading(true);
    const res = await api.savedPartners.savePartner(student.id);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setActionMessage('Saved to your learning partners!');
      onActionComplete?.();
    }
  };

  const handleBlockStudent = async () => {
    setLoading(true);
    const res = await api.blocks.blockStudent(student.id, blockReason);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setActionMessage('Student blocked');
      setConnectionStatus('BLOCKED');
      setBlockPromptOpen(false);
      onActionComplete?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Cover & Avatar */}
        <div className="relative h-28 bg-gradient-to-r from-brand-900/60 via-purple-900/40 to-slate-900 border-b border-slate-800/80 px-6 flex items-end">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 translate-y-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white tracking-wider">
                    {student.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="pt-8">
              <h2 className="text-xl font-bold text-white">{student.fullName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                <span>{student.college}</span>
                <span>•</span>
                <span>{student.branch} ({student.semester})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="pt-12 px-6 pb-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          {actionMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs font-medium">
              {actionMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Academic & Mode Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Degree</span>
              <span className="font-semibold text-white">{student.degree}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Semester</span>
              <span className="font-semibold text-white">{student.semester}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Learning Mode</span>
              <span className="font-semibold text-brand-300 capitalize">
                {student.preferredLearningMode.toLowerCase().replace('_', ' ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Languages</span>
              <span className="font-semibold text-white truncate block">
                {student.languages.join(', ')}
              </span>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About</h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/30 p-3 rounded-xl border border-slate-800/60">
                {student.bio}
              </p>
            </div>
          )}

          {/* Teaching Skills */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span>Skills They Can Teach</span>
            </div>
            {student.teachingSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No teaching skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {student.teachingSkills.map((ts, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                  >
                    <span>{ts.name}</span>
                    <span className="text-[10px] opacity-75 font-normal capitalize">
                      ({ts.proficiency.toLowerCase()})
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Learning Goals */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
              <Target className="w-4 h-4" />
              <span>Skills They Want to Learn</span>
            </div>
            {student.learningGoals.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No learning goals listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {student.learningGoals.map((lg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                  >
                    <span>{lg.name}</span>
                    <span className="text-[10px] opacity-75 font-normal capitalize">
                      ({lg.priority.toLowerCase()} priority)
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Block Confirmation Drawer */}
          {blockPromptOpen && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Block {student.fullName}?</span>
              </div>
              <p className="text-xs text-rose-200/80">
                Blocking this student will remove any connection, cancel pending requests, and prevent them from seeing you or interacting with you on PeerLume.
              </p>
              <input
                type="text"
                placeholder="Optional reason for your records"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/30 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBlockPromptOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={loading}
                  onClick={handleBlockStudent}
                >
                  Confirm Block
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePartner}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Save to your bookmarks"
            >
              <Bookmark className="w-4 h-4 text-brand-400" />
            </button>
            <button
              onClick={() => setBlockPromptOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors"
              title="Block student"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {connectionStatus === 'FRIENDS' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <UserCheck className="w-4 h-4" />
                <span>Connected Friends</span>
              </span>
            )}

            {connectionStatus === 'REQUEST_SENT' && (
              <Button
                variant="outline"
                size="sm"
                isLoading={loading}
                onClick={handleCancelRequest}
                leftIcon={<Clock className="w-4 h-4 text-amber-400" />}
              >
                Cancel Pending Request
              </Button>
            )}

            {connectionStatus === 'REQUEST_RECEIVED' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={handleAcceptRequest}
                leftIcon={<UserCheck className="w-4 h-4" />}
              >
                Accept Request
              </Button>
            )}

            {connectionStatus === 'NONE' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={handleSendRequest}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Connect to Learn
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
