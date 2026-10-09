import { NextRequest, NextResponse } from 'next/server';
import { getTickets, createTicket } from '@/lib/db';
import { triageTicket } from '@/lib/ai/triage';
import { createTicketInputSchema } from '@/lib/ai/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const needsReviewParam = searchParams.get('needs_review');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const needs_review =
      needsReviewParam === 'true'
        ? true
        : needsReviewParam === 'false'
        ? false
        : undefined;

    const tickets = await getTickets({
      status,
      category,
      priority,
      needs_review,
      search,
      limit,
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTicketInputSchema.parse(body);

    // Auto-run AI triage
    const triage = await triageTicket(validated.subject, validated.body);

    const newTicket = await createTicket({
      subject: validated.subject,
      body: validated.body,
      customer_name: validated.customer_name,
      customer_email: validated.customer_email,
      status: triage.needsHumanReview ? 'in_review' : 'open',
      category: triage.category,
      priority: triage.priority,
      department: triage.department,
      ai_confidence: triage.confidence,
      ai_reasoning: triage.reasoning,
      needs_human_review: triage.needsHumanReview,
      human_override: false,
      triaged_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { ticket: newTicket, triage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create ticket' },
      { status: 400 }
    );
  }
}
