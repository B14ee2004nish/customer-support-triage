'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsData } from '@/lib/types';
import GlassCard from './GlassCard';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Loader2,
} from 'lucide-react';

interface AnalyticsChartsProps {
  initialData?: AnalyticsData;
}

export default function AnalyticsCharts({ initialData }: AnalyticsChartsProps) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!initialData) {
      fetch('/api/analytics')
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [initialData]);

  if (loading || !data || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading triage analytics data...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-slate-950/95 border border-white/15 p-3 shadow-xl backdrop-blur-xl text-xs space-y-1">
          <p className="font-bold text-white">{label || payload[0]?.name}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color || item.fill }} className="font-medium">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 bg-gradient-to-br from-indigo-500/15 to-transparent border-indigo-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Autonomous Triage
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.autoTriagedPercentage}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero-touch routing without human intervention
          </p>
        </GlassCard>

        <GlassCard className="p-4 bg-gradient-to-br from-purple-500/15 to-transparent border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Mean Confidence
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {Math.round(data.avgConfidence * 100)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gemini 1.5 Flash semantic classification index
          </p>
        </GlassCard>

        <GlassCard className="p-4 bg-gradient-to-br from-cyan-500/15 to-transparent border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              First Response SLA
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">0.38s</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Average ingestion to routing duration
          </p>
        </GlassCard>

        <GlassCard className="p-4 bg-gradient-to-br from-pink-500/15 to-transparent border-pink-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">
              Total Processed
            </span>
            <Clock className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.totalTriaged}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ingested across all channels
          </p>
        </GlassCard>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <GlassCard className="p-6 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">
                Tickets by Category
              </h3>
            </div>
            <span className="text-xs text-slate-400">Distribution count</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Human Override vs Auto-Triaged Pie Chart */}
        <GlassCard className="p-6 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">
                Triage Decision Split
              </h3>
            </div>
            <span className="text-xs text-slate-400">Human-in-the-Loop ratio</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.reviewBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.reviewBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* 7-Day Trend Line Chart */}
      <GlassCard className="p-6 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">
              7-Day Ticket Volume & Review Trends
            </h3>
          </div>
          <span className="text-xs text-slate-400">Daily triage metrics</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trendData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="tickets"
                name="Total Ingested"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="triaged"
                name="AI Triaged"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 3, fill: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="reviews"
                name="Human Reviews"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ec4899' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
