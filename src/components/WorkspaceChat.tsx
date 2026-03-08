'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatInput } from './ChatInput';
import type { TaskActivity } from '@/lib/types';
import { Bot, User, Loader2 } from 'lucide-react';

interface WorkspaceChatProps {
  taskId: string;
}

export function WorkspaceChat({ taskId }: WorkspaceChatProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsInput, setNeedsInput] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [task, setTask] = useState<{title: string} | null>(null);
  
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
        // Determine if poll / answer is needed based on status or planning flag
        // For openclaw, planning typically halts if waiting for input
        setNeedsInput(data.status === 'planning'); 
      }
    } catch (e) {
      console.error(e);
    }
  }, [taskId]);

  const loadActivities = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const res = await fetch(`/api/tasks/${taskId}/activities`);
      const data = await res.json();

      if (res.ok) {
        setActivities(data);
        if (data.length > lastCountRef.current) {
           setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
        lastCountRef.current = data.length;
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [taskId]);

  // Initial load
  useEffect(() => {
    loadActivities(true);
    checkStatus();
  }, [taskId, loadActivities, checkStatus]);

  // SSE Setup
  useEffect(() => {
    const eventSource = new EventSource('/api/events/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle new activity
        if (data.type === 'activity_logged' && data.payload.task_id === taskId) {
          setActivities(prev => {
            // Check if already exists to prevent duplicates (if POST returns before SSE)
            if (prev.some(a => a.id === data.payload.id)) return prev;
            const newActivities = [data.payload, ...prev];
            
            // Scroll to bottom
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            lastCountRef.current = newActivities.length;
            
            return newActivities;
          });
        }

        // Handle task status changes (to update needsInput/typing)
        if (data.type === 'task_updated' && data.payload.id === taskId) {
          setTask(data.payload);
          setNeedsInput(data.payload.status === 'planning');
        }
      } catch (err) {
        console.error('SSE Parse Error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err);
      eventSource.close();
      // Fallback to one-time refresh after 5s or attempt reconnect
      setTimeout(() => checkStatus(), 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [taskId, checkStatus]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-mc-accent" />
        <div className="text-mc-text-secondary text-sm font-medium tracking-wide">Connecting to Agent Comms...</div>
      </div>
    );
  }

  // Group consecutive messages by the same sender
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
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-mc-text truncate">
            {task ? `#${task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'Workspace Comms'}
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
             <p className="text-xs text-mc-text-secondary leading-relaxed">Agents assigned to this workspace have not transmitted any messages.</p>
          </div>
        ) : (
          groupedActivities.map((group, groupIndex) => {
            const isUser = !group[0].agent;
            
            return (
              <div key={groupIndex} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm ${isUser ? 'bg-mc-accent text-white' : 'bg-mc-bg-tertiary border border-mc-border/40'}`}>
                   {isUser ? <User className="w-4 h-4" /> : <span>{group[0].agent?.avatar_emoji || '🤖'}</span>}
                </div>
                
                {/* Bubble Container */}
                <div className={`chat-bubble-container flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                   <span className="text-[10px] font-bold text-mc-text-secondary uppercase tracking-wider mb-0.5 px-1 opacity-70">
                     {isUser ? 'You' : group[0].agent?.name || 'System Operator'}
                   </span>
                   {group.map((msg, idx) => (
                     <div key={msg.id} className={`${isUser ? 'chat-bubble-user' : 'chat-bubble-agent'}`}>
                       {msg.message}
                       {msg.metadata && (
                         <pre className={`mt-2 p-2 rounded-lg text-[10px] whitespace-pre-wrap overflow-x-auto ${isUser ? 'bg-black/10 text-white/90' : 'bg-mc-bg/50 text-mc-text-secondary border border-mc-border/30'}`}>
                           {typeof msg.metadata === 'string' ? msg.metadata : JSON.stringify(JSON.parse(msg.metadata), null, 2)}
                         </pre>
                       )}
                       {idx === group.length - 1 && (
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
        {activities.length > 0 && needsInput && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-mc-bg-tertiary border border-mc-border/40 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-mc-accent animate-pulse" />
            </div>
            <div className="chat-bubble-agent italic flex items-center gap-2">
              <span className="text-mc-text-secondary">Agent is formulating plan...</span>
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-mc-accent animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 rounded-full bg-mc-accent animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 rounded-full bg-mc-accent animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4"></div>
      </div>

      {(needsInput || activities.length > 0) && (
        <ChatInput taskId={taskId} onSubmitted={() => loadActivities(false)} />
      )}
    </div>
  );
}
