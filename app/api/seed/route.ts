import { NextResponse } from 'next/server';
import { seedTickets } from '@/lib/db';

export async function POST() {
  try {
    const result = await seedTickets();
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.count} synthetic support tickets`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
