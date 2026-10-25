import React, { useState } from 'react';
import { Info } from 'lucide-react';

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

  let badgeText = 'Good Match';
  if (score >= 80) {
    badgeText = 'Top Match';
  } else if (score >= 50) {
    badgeText = 'Strong Match';
  } else {
    badgeText = 'Potential Match';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center font-mono font-semibold rounded-md border border-border bg-surface-hover text-foreground shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer hover:border-border-strong ${sizeClasses}`}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Click to view score breakdown"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
        <span className="font-bold">{score}%</span>
        <span className="font-sans font-normal text-foreground-muted hidden sm:inline text-[11px]">
          ({badgeText})
        </span>
        {breakdown && <Info className="w-3 h-3 text-foreground-muted ml-0.5" />}
      </div>

      {/* Tooltip Breakdown */}
      {showTooltip && breakdown && (
        <div className="absolute right-0 top-full mt-2 z-30 w-56 p-3 rounded-lg bg-card border border-border shadow-lg text-xs space-y-2 text-foreground origin-top-right transition-all duration-150 animate-in fade-in zoom-in-95">
          <div className="font-semibold text-foreground border-b border-border pb-1.5 flex justify-between items-center">
            <span>Score Breakdown</span>
            <span className="font-mono font-bold text-foreground">{score} / 100</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary font-sans">Teach-to-Learn:</span>
              <span className="font-medium text-foreground">+{breakdown.teachToLearn} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary font-sans">Reciprocal Teach:</span>
              <span className="font-medium text-foreground">+{breakdown.reciprocal} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary font-sans">Shared Goals:</span>
              <span className="font-medium text-foreground">+{breakdown.sharedGoals} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary font-sans">Languages:</span>
              <span className="font-medium text-foreground">+{breakdown.language} pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
