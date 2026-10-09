import React from 'react';
import TicketTable from '@/components/TicketTable';
import { getTickets } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Inbox, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TicketsQueuePage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white">Tickets Queue</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filter, search, inspect, and manage all support requests triaged by Gemini 1.5 Flash.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Interactive Filterable Ticket Table */}
      <TicketTable
        tickets={tickets}
        title="All Ingested Tickets"
        subtitle="Search across subject, customer metadata, and filter by severity or business category."
        showFilters={true}
      />
    </div>
  );
}
