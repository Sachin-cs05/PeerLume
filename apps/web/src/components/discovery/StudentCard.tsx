import React, { useState } from 'react';
import type { StudentSearchItem, PartnerRecommendation } from '@peerlume/shared';
import {
  GraduationCap,
  BookOpen,
  Target,
  UserPlus,
  UserCheck,
  Clock,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { MatchScoreBadge } from './MatchScoreBadge.js';
import { MatchExplanationPill } from './MatchExplanationPill.js';
import { StudentProfileModal } from '../connections/StudentProfileModal.js';
import { api } from '../../services/api.js';

interface StudentCardProps {
  student: StudentSearchItem;
  recommendation?: PartnerRecommendation;
  onRefresh?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  recommendation,
  onRefresh,
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(recommendation?.isSaved || false);
  const [status, setStatus] = useState(student.connectionStatus);
  const [requestId, setRequestId] = useState(student.connectionRequestId);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSendRequest = async () => {
    setLoading(true);
    setFeedback(null);
    const res = await api.connections.sendRequest(student.id);
    setLoading(false);
    if (res.error) {
      setFeedback(res.error);
    } else {
      setStatus('REQUEST_SENT');
      setFeedback('Request sent');
      onRefresh?.();
    }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setLoading(true);
    setFeedback(null);
    const res = await api.connections.cancelRequest(requestId);
    setLoading(false);
    if (res.error) {
      setFeedback(res.error);
    } else {
      setStatus('NONE');
      setRequestId(undefined);
      setFeedback('Cancelled');
      onRefresh?.();
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    setLoading(true);
    setFeedback(null);
    const res = await api.connections.acceptRequest(requestId);
    setLoading(false);
    if (res.error) {
      setFeedback(res.error);
    } else {
      setStatus('FRIENDS');
      setFeedback('Connected');
      onRefresh?.();
    }
  };

  const handleToggleSave = async () => {
    setLoading(true);
    if (isSaved) {
      const res = await api.savedPartners.removeSavedPartner(student.id);
      setLoading(false);
      if (!res.error) setIsSaved(false);
    } else {
      const res = await api.savedPartners.savePartner(student.id);
      setLoading(false);
      if (!res.error) setIsSaved(true);
    }
  };

  return (
    <>
      <div className="relative group bg-card border border-border hover:border-border-strong rounded-xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Card Top: Avatar, Name & Match Score */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-hover border border-border flex items-center justify-center overflow-hidden shrink-0">
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-foreground">
                    {student.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-foreground text-sm line-clamp-1">
                  {student.fullName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-foreground-secondary mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-[180px]">{student.college}</span>
                </div>
                <div className="text-[11px] text-foreground-muted">
                  {student.branch} • {student.semester}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {recommendation && (
                <MatchScoreBadge
                  score={recommendation.matchScore}
                  breakdown={recommendation.scoreBreakdown}
                  size="sm"
                />
              )}
              <button
                onClick={handleToggleSave}
                disabled={loading}
                className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background hover:bg-surface-hover border-border text-foreground-muted hover:text-foreground'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save learning partner'}
                aria-label="Save partner"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Truthful Explanations */}
          {recommendation && recommendation.explanations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {recommendation.explanations.slice(0, 3).map((exp, idx) => (
                <MatchExplanationPill key={idx} explanation={exp} />
              ))}
            </div>
          )}

          {/* Bio Preview if present */}
          {student.bio && (
            <p className="text-xs text-foreground-secondary line-clamp-2 mb-3 leading-relaxed">
              {student.bio}
            </p>
          )}

          {/* Skills They Teach */}
          <div className="mb-2.5">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-foreground" /> Can Teach
            </span>
            {student.teachingSkills.length === 0 ? (
              <span className="text-xs text-foreground-muted italic">No skills listed</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.teachingSkills.slice(0, 4).map((ts, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-hover text-foreground border border-border"
                  >
                    {ts.name}
                  </span>
                ))}
                {student.teachingSkills.length > 4 && (
                  <span className="text-[10px] text-foreground-muted self-center">
                    +{student.teachingSkills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Skills They Want to Learn */}
          <div className="mb-3.5">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Target className="w-3 h-3 text-foreground" /> Wants to Learn
            </span>
            {student.learningGoals.length === 0 ? (
              <span className="text-xs text-foreground-muted italic">No goals listed</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.learningGoals.slice(0, 4).map((lg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-background text-foreground-secondary border border-border"
                  >
                    {lg.name}
                  </span>
                ))}
                {student.learningGoals.length > 4 && (
                  <span className="text-[10px] text-foreground-muted self-center">
                    +{student.learningGoals.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Status & Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileModalOpen(true)}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Profile
          </Button>

          <div className="flex items-center gap-2">
            {feedback && (
              <span className="text-[11px] text-foreground-secondary font-mono">
                {feedback}
              </span>
            )}

            {status === 'FRIENDS' && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground font-semibold px-2 py-0.5 rounded-md bg-surface-hover border border-border">
                <UserCheck className="w-3.5 h-3.5" />
                Friends
              </span>
            )}

            {status === 'REQUEST_SENT' && (
              <Button
                variant="outline"
                size="sm"
                isLoading={loading}
                onClick={handleCancelRequest}
                leftIcon={<Clock className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Cancel
              </Button>
            )}

            {status === 'REQUEST_RECEIVED' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={handleAcceptRequest}
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Accept
              </Button>
            )}

            {status === 'NONE' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={handleSendRequest}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>

      {profileModalOpen && (
        <StudentProfileModal
          student={student}
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onActionComplete={() => {
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};
