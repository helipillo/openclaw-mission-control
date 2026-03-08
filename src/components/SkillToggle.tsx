'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface SkillToggleProps {
  skill: Skill;
  agentId: string;
  agentSkills?: string;
}

export function SkillToggle({ skill, agentId, agentSkills }: SkillToggleProps) {
  const [enabled, setEnabled] = useState(() => {
    if (!agentSkills) return true; // Default true if no skills data
    try {
      const parsed = JSON.parse(agentSkills);
      return parsed.includes(skill.id);
    } catch {
      return false;
    }
  });

  const toggleSkill = async () => {
    const newState = !enabled;
    setEnabled(newState); // optimistic UI update
    
    try {
      const res = await fetch(`/api/agents/${agentId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill.id, enabled: newState })
      });
      if (!res.ok) {
        setEnabled(enabled); // Revert on failure
      }
    } catch {
      setEnabled(enabled); // Revert on failure
    }
  };

  return (
    <div 
      onClick={toggleSkill}
      className={`
        p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300
        ${enabled ? 'bg-mc-accent/5 border-mc-accent/20' : 'bg-mc-bg-tertiary/10 border-mc-border/40 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}
      `}
    >
      <div className="flex flex-col gap-0.5">
        <span className={`text-[11px] font-bold ${enabled ? 'text-mc-text' : 'text-mc-text-secondary'}`}>{skill.name}</span>
        <span className="text-[9px] text-mc-text-secondary opacity-60 truncate max-w-[120px]">{skill.category}</span>
      </div>
      
      <div className={`
        w-8 h-4 rounded-full relative transition-colors duration-300
        ${enabled ? 'bg-mc-accent' : 'bg-mc-border'}
      `}>
        <div className={`
          absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300
          ${enabled ? 'translate-x-4' : 'translate-x-0'}
        `} />
      </div>
    </div>
  );
}
