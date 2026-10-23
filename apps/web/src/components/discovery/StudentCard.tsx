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
      setFeedback('Request sent!');
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
      setFeedback('Connected!');
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
      <div className="relative group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Card Top: Avatar, Name & Match Score */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white tracking-wider">
                      {student.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors line-clamp-1">
                  {student.fullName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate max-w-[160px] sm:max-w-[190px]">{student.college}</span>
                </div>
                <div className="text-[11px] text-slate-400">
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
                className={`p-1.5 rounded-lg border transition-colors ${isSaved
                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
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
            <div className="flex flex-wrap gap-1.5 mb-4">
              {recommendation.explanations.slice(0, 3).map((exp, idx) => (
                <MatchExplanationPill key={idx} explanation={exp} />
              ))}
            </div>
          )}

          {/* Bio Preview if present */}
          {student.bio && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {student.bio}
            </p>
          )}

          {/* Skills They Teach */}
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Can Teach
            </span>
            {student.teachingSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills listed</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.teachingSkills.slice(0, 4).map((ts, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]"
                  >
                    {ts.name}
                  </span>
                ))}
                {student.teachingSkills.length > 4 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{student.teachingSkills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Skills They Want to Learn */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Target className="w-3 h-3" /> Wants to Learn
            </span>
            {student.learningGoals.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No goals listed</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.learningGoals.slice(0, 4).map((lg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]"
                  >
                    {lg.name}
                  </span>
                ))}
                {student.learningGoals.length > 4 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{student.learningGoals.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Status & Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileModalOpen(true)}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-white"
          >
            Profile
          </Button>

          <div className="flex items-center gap-2">
            {feedback && (
              <span className="text-[11px] text-emerald-400 animate-fade-in font-medium">
                {feedback}
              </span>
            )}

            {status === 'FRIENDS' && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
                leftIcon={<Clock className="w-3.5 h-3.5 text-amber-400" />}
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
