'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatInput } from './ChatInput';
import type { TaskActivity, Agent, AgentStatus } from '@/lib/types';
import { Bot, User, Loader2 } from 'lucide-react';

interface AgentChatProps {
  agentId: string;
}

export function AgentChat({ agentId }: AgentChatProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('offline');
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  
  const loadAgent = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (res.ok) {
        const body = await res.json();
        setAgent(body);
      }
    } catch (e) {
      console.error(e);
    }
  }, [agentId]);

  const loadActivities = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const res = await fetch(`/api/agents/${agentId}/messages`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        // Hydrate data with agent details for the assistant messages
        const hydrated = data.map((msg: any) => ({
          ...msg,
          agent: msg.agent_id ? agent : undefined
        }));
        
        // Reverse because history comes oldest-first from Gateway, but our grouped logic expects newest-first 
        // OR we can just handle the sorting appropriately. Our WorkspaceChat logic processes in reverse.
        // Let's just set them. OpenClaw gives oldest first [0 -> N]. 
        setActivities(hydrated.reverse()); 
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [agentId, agent]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  useEffect(() => {
    if (agent) {
      loadActivities(true);
    }
    
    // Check initial presence (we don't have a GET endpoint for this right now, 
    // but the next SSE event will update it. Or assume offline until pinged.)
    
    const eventSource = new EventSource('/api/events/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle new direct message
        if (data.type === 'activity_logged' && data.payload.task_id === `agent-${agentId}`) {
          setActivities(prev => {
            if (prev.some(a => a.id === data.payload.id)) return prev;
            
            // Re-hydrate the agent if it's the assistant's message
            const hydratedActivity = {
              ...data.payload,
              agent: data.payload.agent_id ? agent : undefined
            };

            const newActivities = [...prev, hydratedActivity];
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            return newActivities;
          });
        }

        // Handle presence updates
        if (data.type === 'agent_presence' && data.payload.agentId === agentId) {
          setAgentStatus(data.payload.status);
        }
      } catch (err) {
        console.error('SSE Parse Error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [agentId, agent, loadActivities]);

  if (loading || !agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50 h-full">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-mc-accent" />
        <div className="text-mc-text-secondary text-sm font-medium tracking-wide">Connecting to Agent...</div>
      </div>
    );
  }

  // Same grouping logic as WorkspaceChat
  const groupedActivities: TaskActivity[][] = [];
  let currentGroup: TaskActivity[] = [];

  for (let i = activities.length - 1; i >= 0; i--) {
    const activity = activities[i];
    const prevActivity = currentGroup[currentGroup.length - 1];

    if (!prevActivity || prevActivity.agent?.id === activity.agent?.id) {
       currentGroup.push(activity);
    } else {
       groupedActivities.push([...currentGroup]);
       currentGroup = [activity];
    }
  }
  if (currentGroup.length > 0) {
    groupedActivities.push(currentGroup);
  }

  return (
    <div className="flex flex-col h-full bg-mc-bg-secondary/30 rounded-[1.5rem] overflow-hidden border border-mc-border shadow-sm flex-1">
      <div className="p-4 border-b border-mc-border/50 bg-mc-bg/50 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-mc-bg-tertiary border border-mc-border/40 flex items-center justify-center text-xs shrink-0 shadow-sm relative overflow-hidden group">
              {agent?.avatar_emoji || '🤖'}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-mc-bg-secondary/30 ${
              agentStatus === 'working' ? 'bg-green-500' :
              agentStatus === 'standby' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
          </div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-mc-text truncate">
            Direct Message: {agent?.name || 'Agent'}
          </h3>
        </div>
        <div className="text-xs text-mc-text-secondary font-medium">
          {activities.length} Messages
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
             <Bot className="w-12 h-12 mb-4 text-mc-text-secondary opacity-30" />
             <p className="text-sm text-mc-text tracking-wide mb-2 font-semibold">No Secure Comms Yet</p>
             <p className="text-xs text-mc-text-secondary leading-relaxed">You haven&apos;t sent any direct messages to {agent.name}.</p>
          </div>
        ) : (
          groupedActivities.map((group, groupIndex) => {
            const isUser = !group[0].agent;
            
            return (
              <div key={groupIndex} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm ${isUser ? 'bg-mc-accent text-white' : 'bg-mc-bg-tertiary border border-mc-border/40'}`}>
                   {isUser ? <User className="w-4 h-4" /> : <span>{group[0].agent?.avatar_emoji || '🤖'}</span>}
                </div>
                
                <div className={`chat-bubble-container flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                   <span className="text-[10px] font-bold text-mc-text-secondary uppercase tracking-wider mb-0.5 px-1 opacity-70">
                     {isUser ? 'You' : group[0].agent?.name || 'Agent'}
                   </span>
                   {group.map((msg, idx) => (
                     <div key={msg.id} className={`${isUser ? 'chat-bubble-user' : 'chat-bubble-agent'}`}>
                       {msg.message}
                       {idx === group.length - 1 && msg.created_at && (
                         <div className={`text-[9px] mt-1 font-medium tracking-wide ${isUser ? 'text-white/60 text-right' : 'text-mc-text-secondary/50 text-left'}`}>
                           {formatDistanceToNow(new Date(msg.created_at))} ago
                         </div>
                       )}
                     </div>
                   ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} className="h-4"></div>
      </div>

      <ChatInput 
        taskId={`agent-${agentId}`} 
        onSubmitted={() => loadActivities(false)} 
        isAgentDirect={true}
      />
    </div>
  );
}
