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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col text-foreground"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Cover & Avatar */}
        <div className="relative h-24 bg-background-secondary border-b border-border px-6 flex items-end">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-card hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-border transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 translate-y-6">
            <div className="w-16 h-16 rounded-xl bg-surface-hover border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {student.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="pt-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground">{student.fullName}</h2>
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                <GraduationCap className="w-3.5 h-3.5 text-foreground-muted" />
                <span>{student.college}</span>
                <span>•</span>
                <span>{student.branch} ({student.semester})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="pt-9 px-6 pb-6 overflow-y-auto space-y-5 flex-1 text-foreground-secondary">
          {actionMessage && (
            <div className="p-3 bg-surface-hover border border-border rounded-lg text-foreground text-xs font-medium">
              {actionMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Academic & Mode Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-background border border-border">
              <span className="text-foreground-muted text-[11px] block mb-0.5">Degree</span>
              <span className="font-semibold text-foreground">{student.degree}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-background border border-border">
              <span className="text-foreground-muted text-[11px] block mb-0.5">Semester</span>
              <span className="font-semibold text-foreground">{student.semester}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-background border border-border">
              <span className="text-foreground-muted text-[11px] block mb-0.5">Learning Mode</span>
              <span className="font-semibold text-foreground capitalize">
                {student.preferredLearningMode.toLowerCase().replace('_', ' ')}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-background border border-border">
              <span className="text-foreground-muted text-[11px] block mb-0.5">Languages</span>
              <span className="font-semibold text-foreground truncate block">
                {student.languages.join(', ')}
              </span>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="space-y-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">About</h3>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed bg-background p-3 rounded-lg border border-border">
                {student.bio}
              </p>
            </div>
          )}

          {/* Teaching Skills */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <BookOpen className="w-3.5 h-3.5 text-foreground" />
              <span>Skills They Can Teach</span>
            </div>
            {student.teachingSkills.length === 0 ? (
              <p className="text-xs text-foreground-muted italic">No teaching skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.teachingSkills.map((ts, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-hover border border-border text-foreground text-xs font-medium"
                  >
                    <span>{ts.name}</span>
                    <span className="text-[10px] text-foreground-muted font-normal capitalize">
                      ({ts.proficiency.toLowerCase()})
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Learning Goals */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <Target className="w-3.5 h-3.5 text-foreground" />
              <span>Skills They Want to Learn</span>
            </div>
            {student.learningGoals.length === 0 ? (
              <p className="text-xs text-foreground-muted italic">No learning goals listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.learningGoals.map((lg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-foreground text-xs font-medium"
                  >
                    <span>{lg.name}</span>
                    <span className="text-[10px] text-foreground-muted font-normal capitalize">
                      ({lg.priority.toLowerCase()} priority)
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Block Confirmation Drawer */}
          {blockPromptOpen && (
            <div className="p-3.5 rounded-lg bg-background border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Block {student.fullName}?</span>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Blocking this student will remove any connection, cancel pending requests, and prevent future contact.
              </p>
              <input
                type="text"
                placeholder="Optional reason for your records"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-card border border-border text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-foreground"
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
        <div className="p-3.5 bg-background-secondary border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePartner}
              disabled={loading}
              className="p-2 rounded-lg bg-card hover:bg-surface-hover text-foreground-muted hover:text-foreground border border-border transition-colors cursor-pointer"
              title="Save to bookmarks"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBlockPromptOpen(true)}
              className="p-2 rounded-lg bg-card hover:bg-rose-500/10 text-foreground-muted hover:text-rose-500 border border-border transition-colors cursor-pointer"
              title="Block student"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {connectionStatus === 'FRIENDS' && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground font-semibold px-2.5 py-1 rounded-md bg-surface-hover border border-border">
                <UserCheck className="w-3.5 h-3.5" />
                Connected
              </span>
            )}

            {connectionStatus === 'REQUEST_SENT' && (
              <Button
                variant="outline"
                size="sm"
                isLoading={loading}
                onClick={handleCancelRequest}
                leftIcon={<Clock className="w-3.5 h-3.5" />}
              >
                Cancel Request
              </Button>
            )}

            {connectionStatus === 'REQUEST_RECEIVED' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={handleAcceptRequest}
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              >
                Accept Connection
              </Button>
            )}

            {connectionStatus === 'NONE' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={handleSendRequest}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
