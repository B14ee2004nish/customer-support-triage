'use client';

import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ConfidenceBadge({
  confidence,
  size = 'md',
  showLabel = true,
}: ConfidenceBadgeProps) {
  if (confidence === null || confidence === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50">
        Pending AI
      </span>
    );
  }

  const pct = Math.round(confidence * 100);
  const isHigh = pct >= 85;
  const isMedium = pct >= 75 && pct < 85;
  const isLow = pct < 75;

  const colorStyles = isHigh
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : isMedium
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  const sizeStyles =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorStyles} ${sizeStyles} backdrop-blur-md shadow-sm`}
      title={`AI Confidence Score: ${pct}%`}
    >
      {isLow ? (
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      ) : (
        <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      )}
      <span>{pct}%</span>
      {showLabel && (
        <span className="text-[10px] uppercase tracking-wider opacity-80">
          {isHigh ? 'High' : isMedium ? 'Moderate' : 'Low (<75%)'}
        </span>
      )}
    </span>
  );
}
