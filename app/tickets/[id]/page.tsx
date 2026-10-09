import React from 'react';
import TicketDetail from '@/components/TicketDetail';
import { getTicketById } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { ticket, events } = await getTicketById(params.id);

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-sm text-slate-400">
          We couldn't locate ticket identifier <span className="font-mono text-indigo-400 font-semibold">{params.id}</span>. It may have been deleted or reset.
        </p>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Tickets Queue</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <TicketDetail initialTicket={ticket} initialEvents={events} />
    </div>
  );
}
