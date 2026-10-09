import { NextResponse } from 'next/server';
import { resetTickets } from '@/lib/db';

export async function POST() {
  try {
    const result = await resetTickets();
    return NextResponse.json({
      success: true,
      message: 'Tickets database reset successfully',
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
