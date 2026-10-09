export type TicketCategory =
  | 'Billing'
  | 'Technical'
  | 'Account'
  | 'Shipping'
  | 'Refunds'
  | 'General';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'open' | 'in_review' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  ticket_id: string;
  subject: string;
  body: string;
  customer_name: string;
  customer_email: string;
  status: TicketStatus;
  category: TicketCategory | null;
  priority: TicketPriority | null;
  department: string | null;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  needs_human_review: boolean;
  human_override: boolean;
  assigned_to: string | null;
  triaged_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  type: 'created' | 'triaged' | 'human_override' | 'status_changed' | 'reassigned';
  actor: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface TriageResult {
  category: TicketCategory;
  priority: TicketPriority;
  department: string;
  confidence: number;
  reasoning: string;
  needsHumanReview: boolean;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inReviewTickets: number;
  resolvedToday: number;
  avgAiConfidence: number;
  estTimeSavedHours: number;
  overrideRate: number;
}

export interface AnalyticsData {
  categoryDistribution: { category: string; count: number; color: string }[];
  priorityDistribution: { priority: string; count: number; color: string }[];
  reviewBreakdown: { name: string; value: number; color: string }[];
  trendData: { date: string; tickets: number; triaged: number; reviews: number }[];
  totalTriaged: number;
  autoTriagedPercentage: number;
  avgConfidence: number;
}
