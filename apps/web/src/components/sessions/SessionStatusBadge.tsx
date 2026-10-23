import React from 'react';
import type { SessionStatus } from '@peerlume/shared';
import { Clock, CheckCircle2, XCircle, RefreshCw, Ban, Award } from 'lucide-react';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md';
}

export const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    SessionStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: 'Pending',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    ACCEPTED: {
      label: 'Scheduled',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    DECLINED: {
      label: 'Declined',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    RESCHEDULE_REQUESTED: {
      label: 'Reschedule Proposed',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-700/40',
      text: 'text-slate-400',
      border: 'border-slate-700/60',
      icon: <Ban className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      icon: <Award className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.PENDING;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
