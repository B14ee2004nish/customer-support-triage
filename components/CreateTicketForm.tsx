'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from './GlassCard';
import { SAMPLE_TICKETS } from '@/lib/constants';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Zap,
} from 'lucide-react';

export default function CreateTicketForm() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [loading, setLoading] = useState(false);
  const [triageStage, setTriageStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const applySample = (sample: (typeof SAMPLE_TICKETS)[0]) => {
    setSubject(sample.subject);
    setBody(sample.body);
    if (!customerName) setCustomerName('Alex Taylor');
    if (!customerEmail) setCustomerEmail('alex.taylor@enterprise.io');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !customerName.trim() || !customerEmail.trim()) {
      setError('Please fill in all required ticket fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setTriageStage('Submitting ticket to ingestion pipeline...');

    try {
      setTriageStage('Sending prompt to Gemini 1.5 Flash for triage analysis...');

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          subject,
          body,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit ticket');
      }

      setTriageStage('AI Triage classification complete! Saving audit events...');

      const data = await res.json();
      const ticketId = data.ticket.ticket_id;

      // Quick visual confirmation before redirect
      setTimeout(() => {
        router.push(`/tickets/${ticketId}`);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to submit ticket. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sample Quick-fill buttons */}
      <GlassCard className="p-4 bg-slate-900/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Quick Test Scenarios (Click to Pre-fill)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Tests AI categorization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SAMPLE_TICKETS.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applySample(sample)}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 hover:border-indigo-500/40 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                {sample.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {sample.subject}
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Form */}
      <GlassCard gradientBorder className="p-6 sm:p-8 bg-slate-900/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Submit Ticket for Automated AI Triage</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Gemini 1.5 Flash will automatically analyze the complaint, assign category, priority, routing department, and flag for human review if ambiguous.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Customer Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rachel Adams"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Customer Email *</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rachel@customer-org.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ticket Subject *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inbound webhook endpoint throwing SSL error"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Ticket Description / Customer Message *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Detailed description of the customer's problem, transaction ID, error stack trace, or inquiry..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>AI Triage SLA: ~350ms with instant audit event recording</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Triage...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Submit & Auto-Triage</span>
                </>
              )}
            </button>
          </div>

          {loading && triageStage && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2.5 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-cyan-400" />
              <span>{triageStage}</span>
            </div>
          )}
        </form>
      </GlassCard>
    </div>
  );
}
