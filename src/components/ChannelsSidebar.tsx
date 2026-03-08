'use client';

import { useState, useEffect } from 'react';
import { Hash, ChevronDown, ChevronRight, MessageSquare, Search, Bot } from 'lucide-react';
import type { WorkspaceStats, Task, Agent } from '@/lib/types';

interface ChannelsSidebarProps {
  onSelectChannel: (taskId: string) => void;
  selectedChannelId?: string;
}

export function ChannelsSidebar({ onSelectChannel, selectedChannelId }: ChannelsSidebarProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceStats[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [unreadTasks, setUnreadTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wsRes, tasksRes, agentsRes] = await Promise.all([
          fetch('/api/workspaces?stats=true'),
          fetch('/api/tasks'),
          fetch('/api/agents')
        ]);
        
        if (wsRes.ok && tasksRes.ok && agentsRes.ok) {
          const wsData = await wsRes.json();
          const tasksData = await tasksRes.json();
          const agentsData = await agentsRes.json();
          setWorkspaces(wsData);
          setTasks(tasksData);
          setAgents(agentsData.filter((a: Agent) => a.status !== 'offline'));
          
          // Expand all by default
          const initialExpanded: Record<string, boolean> = {};
          wsData.forEach((ws: WorkspaceStats) => {
            initialExpanded[ws.id] = true;
          });
          setExpandedWorkspaces(initialExpanded);

          // Initialize unread states from localStorage vs task update times
          const lastViewed = JSON.parse(localStorage.getItem('mc_last_viewed') || '{}');
          const unreads: Record<string, boolean> = {};
          tasksData.forEach((task: Task) => {
            if (task.id !== selectedChannelId) {
              const lastSeen = lastViewed[task.id] || 0;
              const taskTime = new Date(task.updated_at).getTime();
              if (taskTime > lastSeen) {
                unreads[task.id] = true;
              }
            }
          });
          setUnreadTasks(unreads);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChannelId]);

  // SSE for unread updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'activity_logged') {
          const taskId = data.payload.task_id;
          if (taskId !== selectedChannelId) {
            setUnreadTasks(prev => ({ ...prev, [taskId]: true }));
          }
        }
      } catch (err) {
        // Silently fail SSE for sidebar
      }
    };

    return () => eventSource.close();
  }, [selectedChannelId]);

  // Handle channel selection and clear unread
  const handleSelect = (taskId: string) => {
    const lastViewed = JSON.parse(localStorage.getItem('mc_last_viewed') || '{}');
    lastViewed[taskId] = Date.now();
    localStorage.setItem('mc_last_viewed', JSON.stringify(lastViewed));
    
    setUnreadTasks(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    
    onSelectChannel(taskId);
  };

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="w-64 border-r border-mc-border h-full bg-mc-bg-secondary/50 p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-mc-border rounded w-2/3"></div>
            <div className="h-3 bg-mc-border/50 rounded w-1/2 ml-4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-72 border-r border-mc-border h-full bg-mc-bg-secondary/30 flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mc-text-secondary" />
          <input
            type="text"
            placeholder="Jump to channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-mc-bg-tertiary border border-mc-border/50 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-mc-accent/50 transition-colors"
          />
        </div>
      </div>

      {/* Workspace & Channel List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {/* Active Agents / Direct Messages Section */}
        <div className="mb-4">
          <div className="px-2 py-1.5 flex items-center gap-1.5 opacity-60 mb-1 mt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-mc-text flex-1 text-left">
              Direct Messages
            </span>
            <span className="text-[10px] bg-mc-bg border border-mc-border px-1.5 rounded-full">
              {agents.length}
            </span>
          </div>
          <div className="ml-2 space-y-0.5">
            {agents.length === 0 ? (
               <div className="px-4 py-2 text-[10px] text-mc-text-secondary italic opacity-50">
                 No active agents
               </div>
            ) : (
               agents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map(agent => {
                 const isSelected = selectedChannelId === `agent-${agent.id}`;
                 return (
                   <button
                     key={agent.id}
                     onClick={() => handleSelect(`agent-${agent.id}`)}
                     className={`w-full flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all group relative ${
                       isSelected
                         ? 'bg-mc-accent text-white shadow-md'
                         : 'text-mc-text-secondary hover:bg-mc-bg-tertiary hover:text-mc-text'
                     }`}
                   >
                     <div className="relative">
                       <Bot className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-mc-text-secondary group-hover:opacity-100'}`} />
                       <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-mc-bg"></div>
                     </div>
                     <span className={`truncate flex-1 text-left ${isSelected ? 'font-bold' : 'font-medium'}`}>
                       {agent.name}
                     </span>
                   </button>
                 );
               })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-mc-border/50 my-2"></div>
        
        {workspaces.map(workspace => {
          const workspaceTasks = tasks.filter(t => t.workspace_id === workspace.id);
          const filteredTasks = workspaceTasks.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          if (searchQuery && filteredTasks.length === 0) return null;

          const isExpanded = expandedWorkspaces[workspace.id];

          return (
            <div key={workspace.id} className="mb-2">
              <button 
                onClick={() => toggleWorkspace(workspace.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-mc-text hover:bg-mc-bg-tertiary rounded-lg transition-colors group"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-mc-text-secondary" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-mc-text-secondary" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider opacity-60 flex-1 text-left">
                  {workspace.name}
                </span>
                <span className="text-[10px] bg-mc-bg border border-mc-border px-1.5 rounded-full opacity-50">
                  {workspaceTasks.length}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-1 ml-2 space-y-0.5">
                  {filteredTasks.length === 0 && !searchQuery ? (
                    <div className="px-6 py-2 text-[10px] text-mc-text-secondary italic opacity-50">
                      No tickets yet
                    </div>
                  ) : (
                    filteredTasks.map(task => {
                      const isUnread = unreadTasks[task.id];
                      const isSelected = selectedChannelId === task.id;

                      return (
                        <button
                          key={task.id}
                          onClick={() => handleSelect(task.id)}
                          className={`w-full flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all group relative ${
                            isSelected
                              ? 'bg-mc-accent text-white shadow-md'
                              : 'text-mc-text-secondary hover:bg-mc-bg-tertiary hover:text-mc-text'
                          }`}
                        >
                          <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : isUnread ? 'text-mc-accent opacity-100' : 'text-mc-text-secondary opacity-50 group-hover:opacity-100'}`} />
                          <span className={`truncate flex-1 text-left ${isSelected || isUnread ? 'font-bold' : 'font-medium'}`}>
                            {getSlugFromName(task.title)}
                          </span>
                          {isUnread && !isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-mc-accent shadow-[0_0_8px_rgba(var(--mc-accent-rgb),0.5)]"></span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-mc-border/50 bg-mc-bg-tertiary/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-mc-accent/20 border border-mc-accent/30 flex items-center justify-center text-xs font-bold text-mc-accent shadow-sm">
            DO
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-mc-text truncate">Operator</p>
            <p className="text-[10px] text-mc-accent-green font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-mc-accent-green animate-pulse"></span>
              Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
