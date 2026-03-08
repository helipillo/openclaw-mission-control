'use client';

import React from 'react';
import type { Task } from '@/lib/types';
import { 
  ShieldAlert, Check, X, ArrowRight, User, 
  Terminal, ExternalLink, AlertTriangle, Fingerprint
} from 'lucide-react';

interface ApprovalCardProps {
  task: Task;
}

export function ApprovalCard({ task }: ApprovalCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planning':
        return {
          icon: ShieldAlert,
          color: 'text-mc-accent-purple',
          bg: 'bg-mc-accent-purple/10',
          label: 'Plan Authorization',
          description: 'Agent has formulated a strategy and requires your sign-off before execution.'
        };
      case 'review':
        return {
          icon: AlertTriangle,
          color: 'text-mc-accent',
          bg: 'bg-mc-accent/10',
          label: 'Critical Review',
          description: 'A sensitive action has been paused for manual safety audit.'
        };
      case 'verification':
        return {
          icon: Check,
          color: 'text-mc-accent-green',
          bg: 'bg-mc-accent-green/10',
          label: 'Quality Assurance',
          description: 'Task is complete and awaits your final verification of the deliverables.'
        };
      default:
        return {
          icon: ShieldAlert,
          color: 'text-mc-text-secondary',
          bg: 'bg-mc-bg-tertiary',
          label: 'General Review',
          description: 'Agent requires clarification or assistance.'
        };
    }
  };

  const config = getStatusConfig(task.status);
  const Icon = config.icon;

  return (
    <div className="mc-card group hover:scale-[1.01] transition-all duration-300 p-0 overflow-hidden flex flex-col md:flex-row min-h-[220px]">
      {/* Left Sidebar Status */}
      <div className={`w-full md:w-2 border-r border-mc-border/20 ${config.bg.replace('/10', '/30')}`} />
      
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${config.bg} rounded-xl`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-mc-text tracking-tight">{task.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
                  <span className="text-[10px] text-mc-text-secondary opacity-40">•</span>
                  <span className="text-[10px] text-mc-text-secondary font-mono opacity-60">ID://{task.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-mc-bg border border-mc-border flex items-center justify-center text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                 {task.assigned_agent?.avatar_emoji || '🤖'}
               </div>
            </div>
          </div>

          <p className="text-sm text-mc-text-secondary leading-relaxed mb-6 italic opacity-80">
            &quot;{config.description}&quot;
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
             <div className="px-3 py-1.5 bg-mc-bg rounded-lg border border-mc-border/40 flex items-center gap-2 text-[10px] font-bold uppercase text-mc-text-secondary">
               <Terminal className="w-3 h-3 text-mc-accent" />
               Proposed Action: {task.status === 'planning' ? 'Execution Step 01' : 'Final Merge'}
             </div>
             <div className="px-3 py-1.5 bg-mc-bg rounded-lg border border-mc-border/40 flex items-center gap-2 text-[10px] font-bold uppercase text-mc-text-secondary">
               <Fingerprint className="w-3 h-3 text-mc-accent-purple" />
               Auth Level: Medium
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-mc-border/10">
           <button className="flex items-center gap-2 text-xs font-bold text-mc-text-secondary hover:text-mc-text transition-colors">
             <ExternalLink className="w-3 h-3" /> View Context
           </button>
           
           <div className="flex items-center gap-3">
              <button className="mc-button-secondary !py-2 !px-4 text-[10px] uppercase font-bold flex items-center gap-2 text-mc-accent-red hover:bg-mc-accent-red/10 border-mc-accent-red/20">
                <X className="w-3 h-3" /> Deny
              </button>
              <button className="mc-button-primary !py-2 !px-6 text-[10px] uppercase font-bold flex items-center gap-2">
                <Check className="w-3 h-3" /> Authorize
              </button>
           </div>
        </div>
      </div>

      {/* Action Preview Side Panel (Desktop) */}
      <div className="hidden lg:block w-72 bg-mc-bg-tertiary/20 p-6 border-l border-mc-border/10">
         <div className="text-[10px] font-bold uppercase tracking-widest text-mc-text-secondary opacity-40 mb-4">Simulation Preview</div>
         <div className="space-y-3">
            <div className="h-2 bg-mc-accent-green/20 rounded-full w-3/4"></div>
            <div className="h-2 bg-mc-bg-tertiary rounded-full w-full"></div>
            <div className="h-2 bg-mc-bg-tertiary rounded-full w-5/6"></div>
            <div className="h-2 bg-mc-accent-red/20 rounded-full w-2/3"></div>
         </div>
         <div className="mt-8">
            <div className="text-[10px] font-bold text-mc-accent uppercase mb-2">Confidence Score</div>
            <div className="text-2xl font-bold text-mc-text">0.94</div>
         </div>
      </div>
    </div>
  );
}
