import React from 'react';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import Link from 'next/link';
import { BarChart3, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white">Triage Analytics & Metrics</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Performance indicators, category distributions, human override rates, and 7-day intake volume trends.
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

      <AnalyticsCharts />
    </div>
  );
}
