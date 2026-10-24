import React from 'react';
import type { MatchExplanation } from '@peerlume/shared';
import { BookOpen, ArrowLeftRight, Target, Globe, GraduationCap } from 'lucide-react';

interface MatchExplanationPillProps {
  explanation: MatchExplanation;
}

export const MatchExplanationPill: React.FC<MatchExplanationPillProps> = ({ explanation }) => {
  let icon = <BookOpen className="w-3 h-3 text-foreground shrink-0" />;

  switch (explanation.type) {
    case 'TEACH_TO_LEARN':
      icon = <BookOpen className="w-3 h-3 text-foreground shrink-0" />;
      break;
    case 'RECIPROCAL':
      icon = <ArrowLeftRight className="w-3 h-3 text-foreground shrink-0" />;
      break;
    case 'SHARED_GOAL':
      icon = <Target className="w-3 h-3 text-foreground shrink-0" />;
      break;
    case 'LANGUAGE':
      icon = <Globe className="w-3 h-3 text-foreground shrink-0" />;
      break;
    case 'ACADEMIC':
      icon = <GraduationCap className="w-3 h-3 text-foreground shrink-0" />;
      break;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border border-border bg-surface-hover text-foreground-secondary"
    >
      {icon}
      <span>{explanation.text}</span>
    </span>
  );
};
