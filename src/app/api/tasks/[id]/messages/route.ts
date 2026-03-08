import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { broadcast } from '@/lib/events';
import { v4 as uuidv4 } from 'uuid';
import type { TaskActivity } from '@/lib/types';
import { getOpenClawClient } from '@/lib/openclaw/client';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 1. Log activity in DB
    const activityId = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO task_activities (id, task_id, agent_id, activity_type, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(activityId, taskId, null, 'message', message, now);

    // 2. Broadcast via SSE
    const activity: TaskActivity = {
      id: activityId,
      task_id: taskId,
      activity_type: 'message',
      message: message,
      created_at: now
    };

    broadcast({
      type: 'activity_logged',
      payload: activity
    });

    // 3. Route to OpenClaw if applicable
    if (task.status === 'planning' && task.planning_session_key) {
      // Forward to planning answer logic (we can just call the internal logic or let it be)
      // For simplicity, let's trigger the specialized planning response
      try {
        const client = getOpenClawClient();
        if (!client.isConnected()) await client.connect();

        const answerPrompt = `User's answer: ${message}

Based on this answer and the conversation so far, either:
1. Ask your next question (if you need more information)
2. Complete the planning (if you have enough information)

For another question, respond with JSON:
{
  "question": "Your next question?",
  "options": [
    {"id": "A", "label": "Option A"},
    {"id": "B", "label": "Option B"},
    {"id": "other", "label": "Other"}
  ]
}

If planning is complete, respond with JSON:
{
  "status": "complete",
  "spec": {
    "title": "Task title",
    "summary": "Summary of what needs to be done",
    "deliverables": ["List of deliverables"],
    "success_criteria": ["How we know it's done"],
    "constraints": {}
  }
}`;

        await client.call('chat.send', {
          sessionKey: task.planning_session_key,
          message: answerPrompt,
          idempotencyKey: `msg-planning-${taskId}-${Date.now()}`,
        });
      } catch (err) {
        console.error('[Messages API] Failed to forward to planning:', err);
      }
    } else if (task.assigned_agent_id) {
       // Optional: Send to general session if one exists
       // For now, just logging is enough for the user to "see" it.
    }

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
