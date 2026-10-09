import React from 'react';
import CreateTicketForm from '@/components/CreateTicketForm';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <Link
          href="/tickets"
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Create New Support Ticket</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Live AI Triage
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Submit customer inquiry to trigger immediate classification with Gemini 1.5 Flash.
          </p>
        </div>
      </div>

      <CreateTicketForm />
    </div>
  );
}
