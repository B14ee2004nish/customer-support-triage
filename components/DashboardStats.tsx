'use client';

import React from 'react';
import { DashboardStats as StatsType } from '@/lib/types';
import GlassCard from './GlassCard';
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react';

interface DashboardStatsProps {
  stats: StatsType;
  loading?: boolean;
}

export default function DashboardStats({ stats, loading = false }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Tickets',
      value: loading ? '-' : stats.totalTickets,
      sub: 'All time ingested',
      icon: <Inbox className="w-5 h-5 text-indigo-400" />,
      gradient: 'from-indigo-500/20 to-indigo-600/5',
      border: 'hover:border-indigo-500/40',
      badge: 'Real-time',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Open Queue',
      value: loading ? '-' : stats.openTickets,
      sub: 'Awaiting SLA dispatch',
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/20 to-cyan-600/5',
      border: 'hover:border-cyan-500/40',
      badge: 'Active',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'In Human Review',
      value: loading ? '-' : stats.inReviewTickets,
      sub: 'Conf < 75% or Critical',
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      gradient: 'from-amber-500/20 to-amber-600/5',
      border: 'hover:border-amber-500/40',
      badge: stats.inReviewTickets > 0 ? 'Requires Action' : 'All Clear',
      badgeColor:
        stats.inReviewTickets > 0
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse'
          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Resolved Today',
      value: loading ? '-' : stats.resolvedToday,
      sub: 'Closed & verified',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      border: 'hover:border-emerald-500/40',
      badge: '+18% vs avg',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Avg AI Confidence',
      value: loading ? '-' : `${Math.round(stats.avgAiConfidence * 100)}%`,
      sub: 'Gemini 1.5 Flash precision',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'hover:border-purple-500/40',
      badge: 'Target > 85%',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Est. Time Saved',
      value: loading ? '-' : `${stats.estTimeSavedHours}h`,
      sub: '4.5 min saved per ticket',
      icon: <Timer className="w-5 h-5 text-pink-400" />,
      gradient: 'from-pink-500/20 to-pink-600/5',
      border: 'hover:border-pink-500/40',
      badge: `${stats.overrideRate}% override rate`,
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card, index) => (
        <GlassCard
          key={index}
          className={`p-4 bg-gradient-to-br ${card.gradient} ${card.border}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 rounded-xl bg-slate-900/60 border border-white/5 shadow-inner">
              {card.icon}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
            >
              {card.badge}
            </span>
          </div>

          <div className="space-y-0.5">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {card.title}
            </h4>
            <div className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
              <span>{card.value}</span>
            </div>
            <p className="text-[11px] text-slate-400/90 truncate">{card.sub}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
