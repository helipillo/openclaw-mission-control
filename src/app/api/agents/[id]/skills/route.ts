import { NextRequest, NextResponse } from 'next/server';
import { run, getDb } from '@/lib/db';
import { broadcast } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;
  try {
    const db = getDb();
    const agent = db.prepare('SELECT skills FROM agents WHERE id = ?').get(agentId) as any;
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    let skills: string[] = [];
    if (agent.skills) {
      try {
        skills = JSON.parse(agent.skills);
      } catch {
        skills = [];
      }
    }
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Failed to fetch agent skills:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;

  try {
    const { skillId, enabled } = await request.json();

    if (!skillId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'skillId and enabled are required' }, { status: 400 });
    }

    const db = getDb();
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as any;

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let currentSkills: string[] = [];
    if (agent.skills) {
      try {
        currentSkills = JSON.parse(agent.skills);
      } catch (e) {
        currentSkills = [];
      }
    }

    let newSkills = [...currentSkills];
    if (enabled && !newSkills.includes(skillId)) {
      newSkills.push(skillId);
    } else if (!enabled) {
      newSkills = newSkills.filter((s: string) => s !== skillId);
    }

    run('UPDATE agents SET skills = ?, updated_at = datetime(\'now\') WHERE id = ?', [JSON.stringify(newSkills), agentId]);

    // Broadcast agent update
    broadcast({ 
      type: 'agent_updated', 
      payload: { ...agent, skills: JSON.stringify(newSkills) } as any 
    });

    return NextResponse.json({ success: true, skills: newSkills });
  } catch (error) {
    console.error('Failed to update agent skills:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
