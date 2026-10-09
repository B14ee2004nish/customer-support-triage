'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/lib/types';
import { CATEGORIES, PRIORITIES, STATUSES } from '@/lib/constants';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import ConfidenceBadge from './ConfidenceBadge';
import {
  Search,
  Filter,
  X,
  ExternalLink,
  AlertTriangle,
  User,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  limit?: number;
  onRefresh?: () => void;
}

export default function TicketTable({
  tickets,
  title,
  subtitle,
  showFilters = true,
  limit,
  onRefresh,
}: TicketTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyReview, setOnlyReview] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'created_at' | 'ai_confidence' | 'priority'>('created_at');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtered & sorted tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.ticket_id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q) ||
          t.customer_email.toLowerCase().includes(q) ||
          (t.department && t.department.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (onlyReview) {
      result = result.filter((t) => t.needs_human_review);
    }

    // Sort
    result.sort((a, b) => {
      if (sortField === 'ai_confidence') {
        const valA = a.ai_confidence ?? 0;
        const valB = b.ai_confidence ?? 0;
        return sortAsc ? valA - valB : valB - valA;
      }
      if (sortField === 'priority') {
        const weights: Record<string, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        const valA = a.priority ? weights[a.priority] || 0 : 0;
        const valB = b.priority ? weights[b.priority] || 0 : 0;
        return sortAsc ? valA - valB : valB - valA;
      }
      // default: created_at
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [
    tickets,
    search,
    categoryFilter,
    priorityFilter,
    statusFilter,
    onlyReview,
    sortField,
    sortAsc,
    limit,
  ]);

  const hasActiveFilters =
    search ||
    categoryFilter !== 'all' ||
    priorityFilter !== 'all' ||
    statusFilter !== 'all' ||
    onlyReview;

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setOnlyReview(false);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Open
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            In Review
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-3">
        {(title || subtitle) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {filteredTickets.length} of {tickets.length}
                  </span>
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
            {limit && tickets.length > limit && (
              <Link
                href="/tickets"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>View all {tickets.length} tickets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {showFilters && (
          <div className="p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Bar */}
              <div className="relative sm:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subject, customer, ticket ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  {PRIORITIES.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st === 'in_review' ? 'In Review' : st.charAt(0).toUpperCase() + st.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-bar: Human Review Toggle & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyReview}
                    onChange={(e) => setOnlyReview(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-white/20 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 focus:ring-1"
                  />
                  <span className={`font-medium ${onlyReview ? 'text-amber-400' : 'text-slate-300'}`}>
                    Needs Human Review only
                  </span>
                </label>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span>Sort:</span>
                <button
                  onClick={() => {
                    if (sortField === 'created_at') setSortAsc(!sortAsc);
                    else {
                      setSortField('created_at');
                      setSortAsc(false);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    sortField === 'created_at'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold'
                      : 'bg-slate-950/40 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  Date {sortField === 'created_at' && (sortAsc ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'ai_confidence') setSortAsc(!sortAsc);
                    else {
                      setSortField('ai_confidence');
                      setSortAsc(false);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    sortField === 'ai_confidence'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold'
                      : 'bg-slate-950/40 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  Confidence {sortField === 'ai_confidence' && (sortAsc ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'priority') setSortAsc(!sortAsc);
                    else {
                      setSortField('priority');
                      setSortAsc(false);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    sortField === 'priority'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/30 font-semibold'
                      : 'bg-slate-950/40 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  Priority {sortField === 'priority' && (sortAsc ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-white/10 backdrop-blur-xl bg-slate-900/40 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">AI Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="w-8 h-8 text-slate-600 mb-1" />
                      <p className="font-medium text-slate-300">No tickets found</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search criteria or resetting filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const createdDate = new Date(ticket.created_at);
                  const timeFormatted = createdDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateFormatted = createdDate.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr
                      key={ticket.id || ticket.ticket_id}
                      className="group hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Ticket ID & Subject */}
                      <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                        <div className="flex items-start gap-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                {ticket.ticket_id}
                              </span>
                              {ticket.needs_human_review && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full"
                                  title="Flagged for human triage review"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Review</span>
                                </span>
                              )}
                              {ticket.human_override && (
                                <span
                                  className="text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded-full"
                                  title="Manual human override applied"
                                >
                                  Overridden
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/tickets/${ticket.ticket_id || ticket.id}`}
                              className="block mt-1 font-medium text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 text-sm"
                            >
                              {ticket.subject}
                            </Link>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {ticket.body}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                            {ticket.customer_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200 text-xs">
                              {ticket.customer_name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {ticket.customer_email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CategoryBadge category={ticket.category} size="sm" />
                        {ticket.department && (
                          <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[120px]">
                            {ticket.department}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </td>

                      {/* AI Confidence */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ConfidenceBadge
                          confidence={ticket.ai_confidence}
                          size="sm"
                          showLabel={false}
                        />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {dateFormatted} {timeFormatted}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/tickets/${ticket.ticket_id || ticket.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20 transition-all shadow-sm"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
