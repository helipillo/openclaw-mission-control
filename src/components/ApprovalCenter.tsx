'use client';

import React from 'react';
import { useMissionControl } from '@/lib/store';
import { ApprovalCard } from './ApprovalCard';
import { Inbox, ShieldCheck, Loader2 } from 'lucide-react';

export function ApprovalCenter() {
  const { tasks, isLoading } = useMissionControl();
  
  // Filter tasks that require human interaction
  const pendingApprovals = tasks.filter(t => 
    t.status === 'planning' || t.status === 'review' || t.status === 'verification'
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-mc-accent" />
        <p className="text-xs font-bold uppercase tracking-widest text-mc-text-secondary">Scanning for Authorization Requests...</p>
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-mc-bg-secondary/50 rounded-[2rem] border border-dashed border-mc-border/40 animate-in fade-in duration-700">
        <div className="w-16 h-16 bg-mc-bg-secondary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-mc-border/20">
          <ShieldCheck className="w-8 h-8 text-mc-accent-green opacity-40" />
        </div>
        <h3 className="text-lg font-semibold text-mc-text">All Clear</h3>
        <p className="text-sm text-mc-text-secondary mt-1">No pending actions require your authorization right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-mc-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-mc-text opacity-70">Pending Triage ({pendingApprovals.length})</span>
        </div>
        <button className="text-[10px] font-bold uppercase tracking-wider text-mc-accent hover:underline">Clear All (Read Only)</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingApprovals.map(task => (
          <ApprovalCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
