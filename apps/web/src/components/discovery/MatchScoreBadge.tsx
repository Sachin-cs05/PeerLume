import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  breakdown?: {
    teachToLearn: number;
    reciprocal: number;
    sharedGoals: number;
    language: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  breakdown,
  size = 'md',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine color styling based on score
  let gradientClass = 'from-brand-600 via-indigo-600 to-purple-600 text-brand-200 border-brand-500/30';
  let badgeText = 'Good Match';

  if (score >= 80) {
    gradientClass = 'from-emerald-600/30 via-teal-600/30 to-emerald-500/20 text-emerald-300 border-emerald-500/40';
    badgeText = 'Top Match';
  } else if (score >= 50) {
    gradientClass = 'from-sky-600/30 via-indigo-600/30 to-blue-500/20 text-sky-300 border-sky-500/40';
    badgeText = 'Strong Match';
  } else {
    gradientClass = 'from-slate-700/50 via-slate-800/50 to-slate-900/50 text-slate-300 border-slate-700/50';
    badgeText = 'Potential Match';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center font-bold rounded-full border bg-gradient-to-r backdrop-blur-md shadow-sm transition-all cursor-pointer ${gradientClass} ${sizeClasses}`}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Click to view score breakdown"
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-300" />
        <span>{score}%</span>
        <span className="font-normal opacity-75 hidden sm:inline text-xs">({badgeText})</span>
        {breakdown && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
      </div>

      {/* Tooltip Breakdown */}
      {showTooltip && breakdown && (
        <div className="absolute right-0 top-full mt-2 z-30 w-56 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-2 text-slate-200 backdrop-blur-lg">
          <div className="font-semibold text-white border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>Score Breakdown</span>
            <span className="text-brand-400 font-bold">{score} / 100</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Teach-to-Learn:</span>
              <span className="font-medium text-emerald-400">+{breakdown.teachToLearn} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Reciprocal Teach:</span>
              <span className="font-medium text-sky-400">+{breakdown.reciprocal} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Shared Goals:</span>
              <span className="font-medium text-purple-400">+{breakdown.sharedGoals} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Languages:</span>
              <span className="font-medium text-amber-400">+{breakdown.language} pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
