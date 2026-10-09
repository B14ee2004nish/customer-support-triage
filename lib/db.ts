import { Ticket, TicketEvent } from './types';
import seedData from '../data/seed-tickets.json';
import { createClient as createServerSupabase } from './supabase/server';

// In-memory fallback cache when Supabase credentials are not yet configured or tables are not created yet
let memoryTickets: Ticket[] = [];
let memoryEvents: TicketEvent[] = [];

// Cache table existence status to avoid repeated failed queries
let supabaseTableVerified: boolean | null = null;
let lastTableCheckTime = 0;

function initializeMemoryStore() {
  if (memoryTickets.length === 0) {
    memoryTickets = (seedData as any[]).map((t, idx) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `mock-uuid-${idx + 1000}`,
      ticket_id: t.ticket_id,
      subject: t.subject,
      body: t.body,
      customer_name: t.customer_name,
      customer_email: t.customer_email,
      status: t.status || 'open',
      category: t.category,
      priority: t.priority,
      department: t.department,
      ai_confidence: t.ai_confidence,
      ai_reasoning: t.ai_reasoning,
      needs_human_review: t.needs_human_review ?? false,
      human_override: t.human_override ?? false,
      assigned_to: t.assigned_to || null,
      triaged_at: t.triaged_at || new Date().toISOString(),
      created_at: t.created_at || new Date().toISOString(),
      updated_at: t.triaged_at || new Date().toISOString(),
    }));

    // Create initial audit events
    memoryEvents = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : 'evt-1',
        ticket_id: memoryTickets[0]?.id || 'mock-uuid-1000',
        type: 'created',
        actor: 'Marcus Vance (Customer)',
        payload: { channel: 'web-portal' },
        created_at: '2026-10-09T08:14:12Z',
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : 'evt-2',
        ticket_id: memoryTickets[0]?.id || 'mock-uuid-1000',
        type: 'triaged',
        actor: 'gemini-2.5-flash',
        payload: {
          category: 'Technical',
          priority: 'Critical',
          confidence: 0.96,
          needs_human_review: true,
        },
        created_at: '2026-10-09T08:15:00Z',
      },
    ];
  }
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    url.startsWith('https://') &&
    key !== 'placeholder-anon-key'
  );
}

/**
 * Checks if Supabase 'tickets' table exists in the schema cache.
 */
export async function checkSupabaseTableExists(forceRecheck = false): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    supabaseTableVerified = false;
    return false;
  }

  const now = Date.now();
  if (!forceRecheck && supabaseTableVerified !== null && now - lastTableCheckTime < 15000) {
    return supabaseTableVerified;
  }

  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from('tickets').select('id').limit(1);
    lastTableCheckTime = now;

    if (error) {
      if (
        error.message?.includes('schema cache') ||
        error.code === 'PGRST205' ||
        error.message?.includes('does not exist')
      ) {
        supabaseTableVerified = false;
        return false;
      }
      supabaseTableVerified = false;
      return false;
    }

    supabaseTableVerified = true;
    return true;
  } catch {
    supabaseTableVerified = false;
    return false;
  }
}

export async function getDbStatus(): Promise<{
  configured: boolean;
  tableReady: boolean;
  message: string;
}> {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      tableReady: false,
      message: 'Local Memory Mode (Supabase not configured)',
    };
  }

  const tableReady = await checkSupabaseTableExists();
  return {
    configured: true,
    tableReady,
    message: tableReady
      ? 'Connected: Supabase PostgreSQL'
      : 'Supabase Connected (schema.sql pending)',
  };
}

export async function getTickets(options?: {
  status?: string;
  category?: string;
  priority?: string;
  needs_review?: boolean;
  search?: string;
  limit?: number;
}): Promise<Ticket[]> {
  const tableExists = await checkSupabaseTableExists();

  if (tableExists) {
    try {
      const supabase = createServerSupabase();
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }
      if (options?.priority && options.priority !== 'all') {
        query = query.eq('priority', options.priority);
      }
      if (typeof options?.needs_review === 'boolean') {
        query = query.eq('needs_human_review', options.needs_review);
      }
      if (options?.search) {
        query = query.or(
          `subject.ilike.%${options.search}%,body.ilike.%${options.search}%,customer_name.ilike.%${options.search}%,ticket_id.ilike.%${options.search}%`
        );
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Ticket[];
      }
      if (!error && data && data.length === 0) {
        await seedTickets();
        const { data: seededData } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });
        if (seededData && seededData.length > 0) {
          return seededData as Ticket[];
        }
      }
    } catch {
      // Fall through to memory store gracefully
    }
  }

  // Local in-memory fallback
  initializeMemoryStore();
  let result = [...memoryTickets];

  if (options?.status && options.status !== 'all') {
    result = result.filter((t) => t.status === options.status);
  }
  if (options?.category && options.category !== 'all') {
    result = result.filter((t) => t.category === options.category);
  }
  if (options?.priority && options.priority !== 'all') {
    result = result.filter((t) => t.priority === options.priority);
  }
  if (typeof options?.needs_review === 'boolean') {
    result = result.filter((t) => t.needs_human_review === options.needs_review);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.subject.toLowerCase().includes(s) ||
        t.body.toLowerCase().includes(s) ||
        t.customer_name.toLowerCase().includes(s) ||
        t.ticket_id.toLowerCase().includes(s)
    );
  }

  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getTicketById(id: string): Promise<{
  ticket: Ticket | null;
  events: TicketEvent[];
}> {
  const tableExists = await checkSupabaseTableExists();

  if (tableExists) {
    try {
      const supabase = createServerSupabase();

      // 1. Try ticket_id first (e.g. TICK-4010)
      let { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', id)
        .maybeSingle();

      // 2. Fall back to UUID id column only if parameter matches UUID pattern
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!ticket && isUuid) {
        const { data: byId } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        ticket = byId;
      }

      if (ticket) {
        const { data: events } = await supabase
          .from('ticket_events')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });

        return {
          ticket: ticket as Ticket,
          events: (events || []) as TicketEvent[],
        };
      }
    } catch {
      // Fall through to memory store gracefully
    }
  }

  initializeMemoryStore();
  // Try ticket_id first, then id
  const ticket =
    memoryTickets.find((t) => t.ticket_id === id) ||
    memoryTickets.find((t) => t.id === id) ||
    null;

  const events = ticket
    ? memoryEvents.filter((e) => e.ticket_id === ticket.id || e.ticket_id === ticket.ticket_id)
    : [];

  return { ticket, events };
}

export async function createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
  const now = new Date().toISOString();
  const ticketId =
    ticketData.ticket_id ||
    `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

  const generatedUuid = crypto.randomUUID ? crypto.randomUUID() : `mock-uuid-${Date.now()}`;

  const insertPayload = {
    ticket_id: ticketId,
    subject: ticketData.subject || '',
    body: ticketData.body || '',
    customer_name: ticketData.customer_name || 'Customer',
    customer_email: ticketData.customer_email || 'user@example.com',
    status: ticketData.status || 'open',
    category: ticketData.category || null,
    priority: ticketData.priority || null,
    department: ticketData.department || null,
    ai_confidence: ticketData.ai_confidence ?? null,
    ai_reasoning: ticketData.ai_reasoning || null,
    needs_human_review: ticketData.needs_human_review ?? false,
    human_override: ticketData.human_override ?? false,
    assigned_to: ticketData.assigned_to || null,
    triaged_at: ticketData.triaged_at || null,
    created_at: ticketData.created_at || now,
    updated_at: now,
  };

  const tableExists = await checkSupabaseTableExists();

  if (tableExists) {
    try {
      const supabase = createServerSupabase();
      // Insert without overriding id, letting Postgres assign default gen_random_uuid(),
      // and retrieve full row with select()
      const { data, error } = await supabase
        .from('tickets')
        .insert([insertPayload])
        .select()
        .single();

      if (!error && data) {
        await supabase.from('ticket_events').insert([
          {
            ticket_id: data.id,
            type: 'created',
            actor: data.customer_name,
            payload: { subject: data.subject },
          },
        ]);
        if (data.triaged_at) {
          await supabase.from('ticket_events').insert([
            {
              ticket_id: data.id,
              type: 'triaged',
              actor: 'gemini-2.5-flash',
              payload: {
                category: data.category,
                priority: data.priority,
                confidence: data.ai_confidence,
                needs_human_review: data.needs_human_review,
              },
            },
          ]);
        }
        return data as Ticket;
      }
    } catch {
      // Fall through to memory store gracefully
    }
  }

  initializeMemoryStore();
  const newTicket: Ticket = {
    id: generatedUuid,
    ...insertPayload,
  };
  memoryTickets.unshift(newTicket);
  memoryEvents.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}-1`,
    ticket_id: newTicket.id,
    type: 'created',
    actor: newTicket.customer_name,
    payload: { subject: newTicket.subject },
    created_at: now,
  });

  if (newTicket.triaged_at) {
    memoryEvents.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}-2`,
      ticket_id: newTicket.id,
      type: 'triaged',
      actor: 'gemini-2.5-flash',
      payload: {
        category: newTicket.category,
        priority: newTicket.priority,
        confidence: newTicket.ai_confidence,
        needs_human_review: newTicket.needs_human_review,
      },
      created_at: now,
    });
  }

  return newTicket;
}

export async function updateTicket(
  id: string,
  updates: Partial<Ticket>,
  eventDetails?: { actor: string; type: string; payload: any }
): Promise<Ticket | null> {
  const now = new Date().toISOString();
  const tableExists = await checkSupabaseTableExists();

  if (tableExists) {
    try {
      const supabase = createServerSupabase();

      // 1. Try updating by ticket_id first
      let { data, error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at: now })
        .eq('ticket_id', id)
        .select()
        .maybeSingle();

      // 2. Fall back to UUID id column only if parameter matches UUID pattern
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!data && isUuid) {
        const res = await supabase
          .from('tickets')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .maybeSingle();
        data = res.data;
        error = res.error;
      }

      if (!error && data) {
        if (eventDetails) {
          await supabase.from('ticket_events').insert([
            {
              ticket_id: data.id,
              type: eventDetails.type,
              actor: eventDetails.actor,
              payload: eventDetails.payload,
            },
          ]);
        }
        return data as Ticket;
      }
    } catch {
      // Fall through to memory store gracefully
    }
  }

  initializeMemoryStore();
  const index = memoryTickets.findIndex(
    (t) => t.ticket_id === id || t.id === id
  );
  if (index === -1) return null;

  const current = memoryTickets[index];
  const updated: Ticket = {
    ...current,
    ...updates,
    updated_at: now,
  };
  memoryTickets[index] = updated;

  if (eventDetails) {
    memoryEvents.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`,
      ticket_id: updated.id,
      type: eventDetails.type as any,
      actor: eventDetails.actor,
      payload: eventDetails.payload,
      created_at: now,
    });
  }

  return updated;
}

export async function seedTickets(): Promise<{ count: number; provider: string }> {
  const seeds = (seedData as any[]).map((t, idx) => ({
    ticket_id: t.ticket_id,
    subject: t.subject,
    body: t.body,
    customer_name: t.customer_name,
    customer_email: t.customer_email,
    status: t.status || 'open',
    category: t.category,
    priority: t.priority,
    department: t.department,
    ai_confidence: t.ai_confidence,
    ai_reasoning: t.ai_reasoning,
    needs_human_review: t.needs_human_review ?? false,
    human_override: t.human_override ?? false,
    assigned_to: t.assigned_to || null,
    triaged_at: t.triaged_at || new Date().toISOString(),
    created_at: t.created_at || new Date().toISOString(),
    updated_at: t.triaged_at || new Date().toISOString(),
  }));

  const tableExists = await checkSupabaseTableExists(true);

  if (tableExists) {
    try {
      const supabase = createServerSupabase();
      const { error } = await supabase.from('tickets').upsert(seeds, {
        onConflict: 'ticket_id',
      });
      if (!error) {
        return { count: seeds.length, provider: 'supabase' };
      }
    } catch {
      // Fall through
    }
  }

  memoryTickets = (seeds as any[]).map((s) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : `mock-uuid-${s.ticket_id}`,
    ...s,
  }));
  memoryEvents = [];
  return { count: memoryTickets.length, provider: 'local' };
}

export async function resetTickets(): Promise<{ success: boolean }> {
  const tableExists = await checkSupabaseTableExists();

  if (tableExists) {
    try {
      const supabase = createServerSupabase();
      await supabase.from('ticket_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // Fall through
    }
  }

  memoryTickets = [];
  memoryEvents = [];
  return { success: true };
}
