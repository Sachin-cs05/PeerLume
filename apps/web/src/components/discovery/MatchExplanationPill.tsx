import React from 'react';
import type { MatchExplanation } from '@peerlume/shared';
import { BookOpen, ArrowLeftRight, Target, Globe, GraduationCap } from 'lucide-react';

interface MatchExplanationPillProps {
  explanation: MatchExplanation;
}

export const MatchExplanationPill: React.FC<MatchExplanationPillProps> = ({ explanation }) => {
  let icon = <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  let colorClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';

  switch (explanation.type) {
    case 'TEACH_TO_LEARN':
      icon = <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      colorClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
      break;
    case 'RECIPROCAL':
      icon = <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      colorClass = 'bg-sky-500/10 border-sky-500/20 text-sky-300';
      break;
    case 'SHARED_GOAL':
      icon = <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      colorClass = 'bg-purple-500/10 border-purple-500/20 text-purple-300';
      break;
    case 'LANGUAGE':
      icon = <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      colorClass = 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      break;
    case 'ACADEMIC':
      icon = <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      colorClass = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${colorClass}`}
    >
      {icon}
      <span>{explanation.text}</span>
    </span>
  );
};
