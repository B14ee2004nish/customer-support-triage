'use client';

import React from 'react';
import { TicketPriority } from '@/lib/types';
import { PRIORITY_COLORS } from '@/lib/constants';
import { Flame, ArrowUpCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority | string | null | undefined;
  size?: 'sm' | 'md';
}

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  Critical: <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
  High: <ArrowUpCircle className="w-3.5 h-3.5 text-orange-400" />,
  Medium: <MinusCircle className="w-3.5 h-3.5 text-blue-400" />,
  Low: <ArrowDownCircle className="w-3.5 h-3.5 text-slate-400" />,
};

export default function PriorityBadge({
  priority,
  size = 'md',
}: PriorityBadgeProps) {
  if (!priority) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        None
      </span>
    );
  }

  const validPriority = priority as TicketPriority;
  const config =
    PRIORITY_COLORS[validPriority] || PRIORITY_COLORS.Medium;
  const icon = PRIORITY_ICONS[validPriority];

  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md font-semibold ${config.bg} ${config.text} ${config.border} ${sizeClass}`}
    >
      {icon}
      <span>{priority}</span>
    </span>
  );
}
