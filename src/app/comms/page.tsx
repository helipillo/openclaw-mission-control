'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ChannelsSidebar } from '@/components/ChannelsSidebar';
import { WorkspaceChat } from '@/components/WorkspaceChat';
import { AgentChat } from '@/components/AgentChat';
import { MessageSquare, Hash, Bot } from 'lucide-react';

export default function CommsPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  return (
    <div className="flex flex-col h-screen bg-mc-bg overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ChannelsSidebar 
          onSelectChannel={(id) => setSelectedTaskId(id)} 
          selectedChannelId={selectedTaskId}
        />

        {/* Chat Area */}
        <main className="flex-1 relative bg-mc-bg-secondary/10 flex flex-col min-w-0">
          {selectedTaskId ? (
             <div className="flex-1 relative p-4 lg:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mc-bg-secondary/20 via-mc-bg to-mc-bg h-full">
                {selectedTaskId.startsWith('agent-') ? (
                  <AgentChat agentId={selectedTaskId.replace('agent-', '')} key={`agent-${selectedTaskId}`} />
                ) : (
                  <WorkspaceChat taskId={selectedTaskId} key={`task-${selectedTaskId}`} />
                )}
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-[2rem] bg-mc-bg-tertiary border border-mc-border flex items-center justify-center mb-6 shadow-sm">
                <Hash className="w-10 h-10 text-mc-accent opacity-40" />
              </div>
              <h2 className="text-2xl font-semibold text-mc-text mb-2 tracking-tight">Welcome to Agent Comms</h2>
              <p className="text-mc-text-secondary max-w-md font-light leading-relaxed">
                Select a workspace ticket from the sidebar to view agent transmissions, 
                collaborate on planning, or monitor autonomous activities.
              </p>
              
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                <div className="p-4 rounded-2xl bg-mc-bg-tertiary/50 border border-mc-border/50 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-mc-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-mc-text">Human-in-the-Loop</span>
                  </div>
                  <p className="text-xs text-mc-text-secondary font-light leading-normal">
                    Reply directly to agents when they request clarification or approval during mission planning.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-mc-bg-tertiary/50 border border-mc-border/50 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-mc-accent-purple" />
                    <span className="text-xs font-bold uppercase tracking-wider text-mc-text">Agent Dialogue</span>
                  </div>
                  <p className="text-xs text-mc-text-secondary font-light leading-normal">
                    Watch as agents coordinate tasks, share findings, and execute complex workflows in real-time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
