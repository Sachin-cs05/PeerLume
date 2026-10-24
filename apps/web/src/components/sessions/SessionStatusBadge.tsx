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
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    ACCEPTED: {
      label: 'Scheduled',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    DECLINED: {
      label: 'Declined',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/30',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    RESCHEDULE_REQUESTED: {
      label: 'Reschedule Proposed',
      bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
      text: 'text-zinc-700 dark:text-zinc-200',
      border: 'border-zinc-400/30 dark:border-zinc-600/30',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-zinc-100 dark:bg-zinc-900',
      text: 'text-zinc-500 dark:text-zinc-400',
      border: 'border-zinc-200 dark:border-zinc-800',
      icon: <Ban className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
      text: 'text-white dark:text-zinc-900',
      border: 'border-transparent',
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
