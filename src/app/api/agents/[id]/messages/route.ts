import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getOpenClawClient } from '@/lib/openclaw/client';
import { broadcast } from '@/lib/events';
import type { Agent, OpenClawSession, TaskActivity } from '@/lib/types';

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
      return NextResponse.json([]);
    }

    const client = getOpenClawClient();
    if (!client.isConnected()) {
      await client.connect();
    }

    // `chat.history` from OpenClaw returns an object with `messages`
    const historyResult = await client.getSessionHistory(session.openclaw_session_id) as { messages?: any[] };
    const historyMags = historyResult?.messages || [];

    // Map to a format AgentChat can consume easily (similar to task_activities)
    const messages = historyMags.filter(h => h.role === 'user' || h.role === 'assistant').map((msg: any, i) => {
      // OpenClaw message content can be an array of objects (like Claude) or a string
      const textContent = Array.isArray(msg.content) 
        ? msg.content.find((c: any) => c.type === 'text')?.text || ''
        : typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

      return {
        id: `${agentId}-msg-${i}`,
        task_id: `agent-${agentId}`,
        agent_id: msg.role === 'assistant' ? agentId : undefined,
        activity_type: 'message',
        message: textContent,
        created_at: msg.createdAt || msg.timestamp || new Date().toISOString()
      };
    });

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

    const now = new Date().toISOString();
    const activity: TaskActivity = {
      id: `${agentId}-msg-${Date.now()}`,
      task_id: `agent-${agentId}`,
      activity_type: 'message',
      message: message,
      created_at: now
    };

    broadcast({
      type: 'activity_logged', // use activity_logged to reuse AgentChat's existing SSE logic if any, but AgentChat currently doesn't have an SSE listener!
      payload: activity
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Failed to send direct message to agent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
