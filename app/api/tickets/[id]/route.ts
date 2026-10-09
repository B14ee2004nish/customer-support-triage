import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTicketById, updateTicket } from '@/lib/db';
import { updateTicketSchema } from '@/lib/ai/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let ticket = null;
    let events: any[] = [];

    // Try looking up from Supabase: try ticket_id first, then fall back to id
    try {
      const supabase = createClient();

      // 1. Try ticket_id first (e.g. TICK-4010)
      const { data: byTicketId, error: err1 } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', id)
        .maybeSingle();

      if (!err1 && byTicketId) {
        ticket = byTicketId;
      } else {
        // 2. Fall back to UUID id column only if parameter matches UUID format
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const { data: byId } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (byId) ticket = byId;
        }
      }

      if (ticket) {
        const { data: eventRows } = await supabase
          .from('ticket_events')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });
        events = eventRows || [];
      }
    } catch {
      // Supabase unconfigured or offline, fall back to memory store
    }

    // Fall back to local store if not found in Supabase
    if (!ticket) {
      const result = await getTicketById(id);
      ticket = result.ticket;
      events = result.events;
    }

    if (!ticket) {
      return NextResponse.json(
        { error: `Ticket not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ticket,
      events,
    });
  } catch (error: any) {
    console.error('Error getting ticket:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = updateTicketSchema.parse(body);

    // Retrieve existing ticket (trying ticket_id first, then falling back to id)
    let existing: any = null;
    try {
      const supabase = createClient();
      const { data: byTicketId } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', id)
        .maybeSingle();

      if (byTicketId) {
        existing = byTicketId;
      } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const { data: byId } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          existing = byId;
        }
      }
    } catch {
      // fallback
    }

    if (!existing) {
      const fallbackResult = await getTicketById(id);
      existing = fallbackResult.ticket;
    }

    if (!existing) {
      return NextResponse.json(
        { error: `Ticket not found for ID: ${id}` },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (validated.category !== undefined) updates.category = validated.category;
    if (validated.priority !== undefined) updates.priority = validated.priority;
    if (validated.status !== undefined) updates.status = validated.status;
    if (validated.department !== undefined) updates.department = validated.department;
    if (validated.assigned_to !== undefined) updates.assigned_to = validated.assigned_to;
    if (validated.needs_human_review !== undefined) updates.needs_human_review = validated.needs_human_review;
    if (validated.human_override !== undefined) updates.human_override = validated.human_override;

    // Detect if this is a human override
    const isOverride =
      (validated.category && validated.category !== existing.category) ||
      (validated.priority && validated.priority !== existing.priority) ||
      validated.human_override === true;

    if (isOverride) {
      updates.human_override = true;
      updates.needs_human_review = false;
    }

    const eventType = isOverride ? 'human_override' : validated.status ? 'status_changed' : 'reassigned';
    const actor = validated.assigned_to || 'Human Triage Specialist';

    const updatedTicket = await updateTicket(existing.ticket_id || existing.id, updates, {
      actor,
      type: eventType,
      payload: {
        previous: {
          category: existing.category,
          priority: existing.priority,
          status: existing.status,
          department: existing.department,
        },
        updated: updates,
        notes: validated.override_notes || null,
      },
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update ticket' },
      { status: 400 }
    );
  }
}
