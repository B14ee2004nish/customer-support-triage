import { NextRequest, NextResponse } from 'next/server';
import { triageTicket } from '@/lib/ai/triage';
import { z } from 'zod';

const triageInputSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const { subject, body } = triageInputSchema.parse(raw);

    const triage = await triageTicket(subject, body);

    return NextResponse.json({ triage });
  } catch (error: any) {
    console.error('Triage error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to triage ticket' },
      { status: 400 }
    );
  }
}
