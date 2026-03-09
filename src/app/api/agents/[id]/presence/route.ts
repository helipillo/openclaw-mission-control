import { NextRequest, NextResponse } from 'next/server';
import { presenceManager } from '@/lib/presence';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;

  try {
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Record presence heartbeat
    presenceManager.heartbeat(agentId, status);

    return NextResponse.json({ success: true, agentId, status });
  } catch (error) {
    console.error('Failed to log presence:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
