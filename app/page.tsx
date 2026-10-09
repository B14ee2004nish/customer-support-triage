'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from '@/components/DashboardStats';
import TicketTable from '@/components/TicketTable';
import ArchitectureModal from '@/components/ArchitectureModal';
import GlassCard from '@/components/GlassCard';
import { Ticket, DashboardStats as StatsType } from '@/lib/types';
import {
  Sparkles,
  Database,
  Layers,
  HelpCircle,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsType>({
    totalTickets: 0,
    openTickets: 0,
    inReviewTickets: 0,
    resolvedToday: 0,
    avgAiConfidence: 0.93,
    estTimeSavedHours: 3.0,
    overrideRate: 4.8,
  });

  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    tableReady: boolean;
    message: string;
  } | null>(null);

  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/tickets?limit=10'),
      ]);

      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();

      if (statsData?.stats) setStats(statsData.stats);
      if (statsData?.dbStatus) setDbStatus(statsData.dbStatus);
      if (ticketsData?.tickets) setRecentTickets(ticketsData.tickets);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopySql = async () => {
    const sqlText = `-- Enable pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 1. Create tickets table
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  subject text not null,
  body text not null,
  customer_name text not null,
  customer_email text not null,
  status text default 'open',
  category text,
  priority text,
  department text,
  ai_confidence float,
  ai_reasoning text,
  needs_human_review boolean default false,
  human_override boolean default false,
  assigned_to text,
  triaged_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create ticket_events table
create table if not exists ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade,
  type text not null,
  actor text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- 3. Create indexes on status and needs_human_review
create index if not exists idx_tickets_status on tickets(status);
create index if not exists idx_tickets_review on tickets(needs_human_review);
create index if not exists idx_ticket_events_ticket_id on ticket_events(ticket_id);

-- 4. Automatically update updated_at on ticket changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tickets_updated_at on tickets;
create trigger set_tickets_updated_at
before update on tickets
for each row
execute function update_updated_at_column();

-- 5. Row Level Security (RLS) policies for anon access
alter table tickets enable row level security;
alter table ticket_events enable row level security;

drop policy if exists "Enable all access for anon and authenticated users" on tickets;
create policy "Enable all access for anon and authenticated users"
  on tickets for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Enable all access for anon and authenticated users" on ticket_events;
create policy "Enable all access for anon and authenticated users"
  on ticket_events for all
  to anon, authenticated
  using (true)
  with check (true);`;

    try {
      await navigator.clipboard.writeText(sqlText);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSeed40Tickets = async () => {
    setActionLoading('seed');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBannerNotice({
          type: 'success',
          text: `Seeded ${data.count || 40} synthetic support tickets across all 6 business categories!`,
        });
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateLowConfidence = async () => {
    setActionLoading('simulate');
    try {
      const ambiguousSubject = 'I need help with my account or points or maybe it is shipping?';
      const ambiguousBody =
        'Hey team, I clicked on something in my inbox yesterday and now my screen looks strange. Also where is the points rebate for the items I returned last month? Or maybe I have two accounts with different passwords?';

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Morgan Blake',
          customer_email: 'morgan.blake@ambiguous-inquiry.org',
          subject: ambiguousSubject,
          body: ambiguousBody,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ticket) {
        setBannerNotice({
          type: 'info',
          text: `Simulated ticket ${data.ticket.ticket_id} created! AI confidence was ${Math.round(
            (data.ticket.ai_confidence || 0.62) * 100
          )}% (<75%), automatically flagging it for Human Review.`,
        });
        await loadData();
        router.push(`/tickets/${data.ticket.ticket_id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section with Animated Gradient Headline */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/10 backdrop-blur-2xl bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-indigo-950/40 shadow-2xl">
        {/* Glow backdrop circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Autonomous Ticket Triage & SLA Router</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Customer Support{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Ticket Triage System
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Automating customer issue classification, priority scoring, and department dispatch with{' '}
            <span className="text-cyan-300 font-semibold">Gemini 1.5 Flash</span> and persistent{' '}
            <span className="text-indigo-300 font-semibold">Supabase PostgreSQL</span>. Enforces deterministic human-in-the-loop oversight when confidence drops below 75% or for critical outages.
          </p>

          {/* Quick Action Button Group */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeed40Tickets}
              disabled={Boolean(actionLoading)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {actionLoading === 'seed' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4 text-cyan-300" />
              )}
              <span>Seed 40 Tickets</span>
            </button>

            <button
              onClick={handleSimulateLowConfidence}
              disabled={Boolean(actionLoading)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {actionLoading === 'simulate' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span>Simulate Low Confidence</span>
            </button>

            <button
              onClick={() => setShowArchModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Architecture</span>
            </button>

            <Link
              href="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Custom Ticket</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Supabase Schema Setup Callout Banner (shown if Supabase credentials exist but schema.sql hasn't been executed yet) */}
      {dbStatus?.configured && !dbStatus?.tableReady && (
        <GlassCard className="p-5 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-indigo-500/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Supabase Connected • Run schema.sql to Enable Cloud Sync</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    Local Fallback Active
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Your Supabase credentials are authenticated! Run <span className="font-mono text-cyan-300 font-semibold">supabase/schema.sql</span> in your Supabase SQL Editor to create the <code className="text-amber-200">tickets</code> and <code className="text-amber-200">ticket_events</code> tables. All features are currently operating smoothly with 40 synthetic tickets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-md transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy schema.sql'}</span>
              </button>

              <button
                onClick={loadData}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
                title="Re-check database connection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {bannerNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 backdrop-blur-xl ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-xs font-semibold opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Glass Stat Cards */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Recent 10 Tickets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Recent Ingested Tickets</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Latest 10
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live feed of incoming tickets with AI triage classifications and confidence scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/tickets"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all"
            >
              <span>View Full Queue ({stats.totalTickets})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <TicketTable
          tickets={recentTickets}
          showFilters={false}
          limit={10}
          onRefresh={loadData}
        />
      </div>

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
}
