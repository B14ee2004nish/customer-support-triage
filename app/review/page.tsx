import React from 'react';
import ReviewQueue from '@/components/ReviewQueue';
import { getTickets } from '@/lib/db';
import Link from 'next/link';
import { AlertCircle, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HumanReviewPage() {
  const tickets = await getTickets({ needs_review: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white">Human Review Queue</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dedicated triage workstation for ambiguous requests and critical severity incidents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-[1.02] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      <ReviewQueue initialTickets={tickets} />
    </div>
  );
}
