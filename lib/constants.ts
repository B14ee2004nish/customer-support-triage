import { TicketCategory, TicketPriority, TicketStatus } from './types';

export const CATEGORIES: TicketCategory[] = [
  'Billing',
  'Technical',
  'Account',
  'Shipping',
  'Refunds',
  'General',
];

export const PRIORITIES: TicketPriority[] = [
  'Critical',
  'High',
  'Medium',
  'Low',
];

export const STATUSES: TicketStatus[] = [
  'open',
  'in_review',
  'resolved',
  'closed',
];

export const DEPARTMENTS: Record<TicketCategory, string> = {
  Billing: 'Finance & Billing',
  Technical: 'Tier 2 Engineering',
  Account: 'Identity & Security',
  Shipping: 'Logistics & Warehouse',
  Refunds: 'Customer Retention',
  General: 'General Support',
};

export const CATEGORY_COLORS: Record<TicketCategory, { bg: string; text: string; border: string; glow: string }> = {
  Billing: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  Technical: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  Account: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  Shipping: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  Refunds: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  General: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    glow: 'rgba(148, 163, 184, 0.4)',
  },
};

export const PRIORITY_COLORS: Record<TicketPriority, { bg: string; text: string; border: string; dot: string }> = {
  Critical: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    dot: 'bg-rose-500',
  },
  High: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    dot: 'bg-orange-500',
  },
  Medium: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    dot: 'bg-blue-500',
  },
  Low: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/40',
    dot: 'bg-slate-400',
  },
};

export const SAMPLE_TICKETS = [
  {
    title: 'Critical DB Outage',
    subject: 'Production cluster returning 500 internal server error across all endpoints',
    body: 'The primary PostgreSQL cluster replica lag is over 3 hours. Read connections are failing and customer checkouts are completely blocked.',
  },
  {
    title: 'Duplicate Billing',
    subject: 'Charged twice on my Amex card for annual Pro plan renewal',
    body: 'I saw two charges of $299 on statement dated yesterday. Invoice IDs are #INV-4911 and #INV-4912. Please refund one immediately.',
  },
  {
    title: 'Ambiguous Edge Case',
    subject: 'Not sure if I need a refund or new login or to check shipping',
    body: 'I clicked the button in the email and then the screen turned grey. I also ordered a hat last week. Who do I speak to?',
  },
  {
    title: 'Lost Shipment',
    subject: 'Expedited FedEx parcel tracking says delivered but porch is empty',
    body: 'Tracking FX-182904 says delivered at 10 AM. We checked our building front desk and cameras, but no courier arrived.',
  },
];
