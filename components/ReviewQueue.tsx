'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, TicketCategory, TicketPriority } from '@/lib/types';
import { CATEGORIES, PRIORITIES, DEPARTMENTS } from '@/lib/constants';
import GlassCard from './GlassCard';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import ConfidenceBadge from './ConfidenceBadge';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Flame,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface ReviewQueueProps {
  initialTickets: Ticket[];
}

export default function ReviewQueue({ initialTickets }: ReviewQueueProps) {
  const [tickets, setTickets] = useState<Ticket[]>(
    initialTickets.filter((t) => t.needs_human_review)
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleQuickApprove = async (ticket: Ticket) => {
    setProcessingId(ticket.id || ticket.ticket_id);
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id || ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needs_human_review: false,
          status: 'open',
          override_notes: 'Quick-approved in Human Review triage queue.',
        }),
      });

      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticket.id && t.ticket_id !== ticket.ticket_id));
        setMessage(`Approved ${ticket.ticket_id} - routed to ${ticket.department || 'General Support'}`);
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-indigo-500/10 border border-amber-500/20 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Human-in-the-Loop Review Queue</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {tickets.length} Pending
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Tickets automatically flagged because AI confidence is below the 75% threshold or flagged as Critical priority requiring human verification.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Ticket List */}
      {tickets.length === 0 ? (
        <GlassCard className="p-12 text-center bg-slate-900/40">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Review Queue is Empty!</h3>
            <p className="text-xs text-slate-400 max-w-md">
              All high-risk and ambiguous tickets have been triaged and approved. The autonomous triage pipeline is currently handling inbound traffic.
            </p>
            <Link
              href="/tickets"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
            >
              <span>View Full Ticket Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => {
            const isCritical = ticket.priority === 'Critical';
            const isLowConfidence = (ticket.ai_confidence ?? 1) < 0.75;
            const isProcessing = processingId === (ticket.id || ticket.ticket_id);

            return (
              <GlassCard
                key={ticket.id || ticket.ticket_id}
                className="p-5 bg-slate-900/60 hover:border-amber-500/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                        {ticket.ticket_id}
                      </span>
                      <CategoryBadge category={ticket.category} size="sm" />
                      <PriorityBadge priority={ticket.priority} size="sm" />
                      <ConfidenceBadge confidence={ticket.ai_confidence} size="sm" />

                      {/* Trigger Badge */}
                      {isCritical && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>Critical Severity Flag</span>
                        </span>
                      )}
                      {isLowConfidence && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>Low Confidence (&lt;75%)</span>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/tickets/${ticket.ticket_id || ticket.id}`}
                      className="block text-base font-bold text-white hover:text-indigo-300 transition-colors pt-1"
                    >
                      {ticket.subject}
                    </Link>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Customer: {ticket.customer_name} ({ticket.customer_email})</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleQuickApprove(ticket)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Approve AI Recommendation</span>
                    </button>

                    <Link
                      href={`/tickets/${ticket.ticket_id || ticket.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
                    >
                      <span>Override Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Body Snippet */}
                <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-white/5 line-clamp-2">
                  {ticket.body}
                </p>

                {/* AI Reasoning */}
                {ticket.ai_reasoning && (
                  <div className="flex items-start gap-2 text-xs text-indigo-300/90 bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-cyan-300 mr-1.5">Model Reasoning:</span>
                      <span>{ticket.ai_reasoning}</span>
                      <span className="ml-2 font-mono text-[11px] text-slate-400">
                        → Suggested Department: {ticket.department || 'General Support'}
                      </span>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
