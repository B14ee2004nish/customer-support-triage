'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, TicketEvent, TicketCategory, TicketPriority, TicketStatus } from '@/lib/types';
import { CATEGORIES, PRIORITIES, STATUSES, DEPARTMENTS } from '@/lib/constants';
import GlassCard from './GlassCard';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import ConfidenceBadge from './ConfidenceBadge';
import {
  Sparkles,
  ArrowLeft,
  User,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Check,
  Send,
  History,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface TicketDetailProps {
  initialTicket: Ticket;
  initialEvents: TicketEvent[];
}

export default function TicketDetail({
  initialTicket,
  initialEvents,
}: TicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [events, setEvents] = useState<TicketEvent[]>(initialEvents);

  // Human Override State
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState<TicketCategory>(ticket.category || 'General');
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority || 'Medium');
  const [status, setStatus] = useState<TicketStatus>(ticket.status || 'open');
  const [department, setDepartment] = useState<string>(ticket.department || DEPARTMENTS[category] || 'General Support');
  const [assignedTo, setAssignedTo] = useState<string>(ticket.assigned_to || '');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const confidencePct = ticket.ai_confidence ? Math.round(ticket.ai_confidence * 100) : null;

  const handleCategoryChange = (newCat: TicketCategory) => {
    setCategory(newCat);
    setDepartment(DEPARTMENTS[newCat] || 'General Support');
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id || ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          priority,
          status,
          department,
          assigned_to: assignedTo.trim() || null,
          human_override: true,
          needs_human_review: false,
          override_notes: overrideNotes.trim() || 'Manual human triage override applied by specialist.',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update ticket');
      }

      const data = await res.json();
      setTicket(data.ticket);

      // Re-fetch events to show updated timeline
      const fetchEvents = await fetch(`/api/tickets/${ticket.ticket_id || ticket.id}`);
      const freshData = await fetchEvents.json();
      if (freshData?.events) {
        setEvents(freshData.events);
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating ticket');
    } finally {
      setSaving(false);
    }
  };

  const quickApprove = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.ticket_id || ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needs_human_review: false,
          status: 'open',
          override_notes: 'Human specialist approved AI triage recommendation as accurate.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        const refetch = await fetch(`/api/tickets/${ticket.ticket_id || ticket.id}`);
        const fresh = await refetch.json();
        if (fresh?.events) setEvents(fresh.events);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                {ticket.ticket_id}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {ticket.needs_human_review && (
            <button
              onClick={quickApprove}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve AI Triage</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Human Override'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Ticket successfully updated and recorded in audit log.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Grid: Details & AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Inquiry & Event Trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Message Card */}
          <GlassCard className="p-6 bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-sm text-indigo-300">
                    {ticket.customer_name?.charAt(0) || 'C'}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {ticket.customer_name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{ticket.customer_email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CategoryBadge category={ticket.category} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Customer Message
              </h4>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-white/5">
                {ticket.body}
              </p>
            </div>
          </GlassCard>

          {/* Human Override Edit Form (Toggleable) */}
          {isEditing && (
            <GlassCard gradientBorder className="p-6 bg-slate-900/90 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-pink-400" />
                  <span>Human-in-the-Loop Override Panel</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust classification or assign team members. This action records an audit trail snapshot.
                </p>
              </div>

              <form onSubmit={handleSaveOverride} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Override Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Override Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TicketPriority)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TicketStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assign Specialist / Agent
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance (Tier 2 Lead)"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Override Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Specialist Notes / Override Reason
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide reasoning for override..."
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SaveIcon className="w-3.5 h-3.5" />}
                    <span>Save Override</span>
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Event Timeline */}
          <GlassCard className="p-6 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Audit Trail & Event Timeline</span>
              </h3>
              <span className="text-xs text-slate-400">{events.length} Events Logged</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              {events.length === 0 ? (
                <p className="text-xs text-slate-500">No events logged yet.</p>
              ) : (
                events.map((evt, idx) => {
                  const isGemini = evt.actor.includes('gemini');
                  const isOverride = evt.type === 'human_override';

                  return (
                    <div key={evt.id || idx} className="relative group">
                      {/* Node Dot */}
                      <span
                        className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                          isOverride
                            ? 'bg-pink-500 border-pink-300'
                            : isGemini
                            ? 'bg-cyan-400 border-cyan-200'
                            : 'bg-indigo-500 border-indigo-300'
                        }`}
                      />

                      <div className="bg-slate-950/50 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white capitalize">
                              {evt.type.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              {evt.actor}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(evt.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>

                        {evt.payload && (
                          <div className="text-xs text-slate-300 font-mono bg-slate-900/60 p-2 rounded-lg border border-white/5 overflow-x-auto text-[11px]">
                            {JSON.stringify(evt.payload, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column (1 Col): AI Decision Panel */}
        <div className="space-y-6">
          <GlassCard gradientBorder className="p-6 bg-slate-900/80 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-white text-base">AI Decision Engine</h3>
              </div>
              <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Gemini 1.5 Flash
              </span>
            </div>

            {/* Confidence Progress Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Confidence Score</span>
                <span className="font-bold text-white text-sm">
                  {confidencePct !== null ? `${confidencePct}%` : 'N/A'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 border border-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    (confidencePct ?? 0) >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                      : (confidencePct ?? 0) >= 75
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${confidencePct ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Uncertain)</span>
                <span className="text-amber-400 font-medium">75% (Review Threshold)</span>
                <span>100% (Certain)</span>
              </div>
            </div>

            {/* Human Review Status Callout */}
            {ticket.needs_human_review && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>Flagged for Human Review</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {(ticket.ai_confidence ?? 1) < 0.75
                    ? 'AI confidence score is below the 75% precision threshold.'
                    : 'Classified as Critical priority. Requires human sign-off per incident protocol.'}
                </p>
              </div>
            )}

            {ticket.human_override && (
              <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Human Override Active</span>
                </div>
                <p className="text-[11px] text-purple-200/90 leading-relaxed">
                  Support specialist manually adjusted classification parameters.
                </p>
              </div>
            )}

            {/* Key Classification Attributes */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Classified Category:</span>
                <CategoryBadge category={ticket.category} size="sm" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Assigned Priority:</span>
                <PriorityBadge priority={ticket.priority} size="sm" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target Department:</span>
                <span className="font-semibold text-slate-200">
                  {ticket.department || 'General Support'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Assigned Agent:</span>
                <span className="font-semibold text-slate-200">
                  {ticket.assigned_to || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* AI Reasoning Text */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Model Reasoning
              </h4>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 leading-relaxed italic">
                "{ticket.ai_reasoning || 'Automated triage reasoning pending.'}"
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return <Check className={className} />;
}
