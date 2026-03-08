import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getOpenClawClient } from '@/lib/openclaw/client';
import type { Agent, OpenClawSession } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;

  try {
    const session = queryOne<OpenClawSession>(
      'SELECT * FROM openclaw_sessions WHERE agent_id = ? AND status = ?',
      [agentId, 'active']
    );

    if (!session) {
      return NextResponse.json({ messages: [] });
    }

    const client = getOpenClawClient();
    if (!client.isConnected()) {
      await client.connect();
    }

    // `sessions.history` from OpenClaw returns OpenClawHistoryMessage[]
    const history = await client.getSessionHistory(session.openclaw_session_id) as any[];

    // Map to a format AgentChat can consume easily (similar to task_activities)
    const messages = history.filter(h => h.role === 'user' || h.role === 'assistant').map((msg: any, i) => ({
      id: `${agentId}-msg-${i}`,
      task_id: `agent-${agentId}`,
      agent_id: msg.role === 'assistant' ? agentId : undefined,
      activity_type: 'message',
      message: msg.content,
      created_at: msg.timestamp || new Date().toISOString()
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to get agent direct messages:', error);
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;

  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const session = queryOne<OpenClawSession>(
      'SELECT * FROM openclaw_sessions WHERE agent_id = ? AND status = ?',
      [agentId, 'active']
    );

    if (!session) {
      return NextResponse.json({ error: 'Agent is not linked to OpenClaw' }, { status: 404 });
    }

    const client = getOpenClawClient();
    if (!client.isConnected()) {
      await client.connect();
    }

    await client.sendMessage(session.openclaw_session_id, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send direct message to agent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
