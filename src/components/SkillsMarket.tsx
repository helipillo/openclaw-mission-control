'use client';

import React, { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import { SkillToggle } from './SkillToggle';
import { Users, Search, Filter, Plus, UserPlus, Info } from 'lucide-react';

const availableSkills = [
  { id: 'bash', name: 'Bash Execution', category: 'System', description: 'Allows agents to run shell commands.' },
  { id: 'search', name: 'Web Search', category: 'Knowledge', description: 'Real-time information retrieval from the web.' },
  { id: 'sql', name: 'SQL Querying', category: 'Database', description: 'Direct access to structured data warehouses.' },
  { id: 'code', name: 'Interpreter', category: 'System', description: 'Safe execution of Python and JS code sandbox.' },
  { id: 'docs', name: 'File Reader', category: 'Content', description: 'Parses PDF, DOCX, and CSV files.' },
];

export function SkillsMarket() {
  const { agents } = useMissionControl();
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* View Tabs */}
      <div className="flex items-center gap-6 border-b border-mc-border/40 pb-px">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'roster' ? 'text-mc-accent border-b-2 border-mc-accent' : 'text-mc-text-secondary opacity-60 hover:opacity-100'}`}
        >
          Active Roster
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'market' ? 'text-mc-accent border-b-2 border-mc-accent' : 'text-mc-text-secondary opacity-60 hover:opacity-100'}`}
        >
          Specialist Market
        </button>
      </div>

      {activeTab === 'roster' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="mc-card p-6 flex flex-col md:flex-row gap-6 hover:border-mc-accent/40 transition-all duration-500">
              {/* Agent Profile */}
              <div className="flex flex-col items-center gap-4 w-full md:w-32 border-r border-mc-border/10 pr-6">
                <div className="w-16 h-16 rounded-2xl bg-mc-bg border border-mc-border flex items-center justify-center text-3xl shadow-sm">
                  {agent.avatar_emoji}
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-mc-text tracking-tight">{agent.name}</h4>
                  <p className="text-[10px] text-mc-accent font-bold uppercase tracking-wider">{agent.role}</p>
                </div>
                <button className="text-[9px] text-mc-text-secondary hover:text-mc-accent flex items-center gap-1 uppercase font-bold tracking-widest opacity-40 hover:opacity-100">
                  <Info className="w-3 h-3" /> Details
                </button>
              </div>

              {/* Skills Configuration */}
              <div className="flex-1 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-mc-text-secondary opacity-60">Equipped Capabilities</span>
                    <span className="text-[10px] text-mc-accent-green font-bold uppercase">v2.4 compatible</span>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSkills.map(skill => (
                      <SkillToggle key={skill.id} skill={skill} agentId={agent.id} agentSkills={agent.skills} />
                    ))}
                 </div>
              </div>
            </div>
          ))}
          
          <button className="mc-card border-dashed p-6 flex items-center justify-center gap-3 text-mc-text-secondary hover:border-mc-accent/40 hover:bg-mc-accent/5 transition-all group">
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Commission New Agent</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock Specialists */}
          {[
            { name: 'Copywriter Pro', role: 'marketing', desc: 'Expert in SEO and conversion copywriting.', price: 'Free', emoji: '✍️' },
            { name: 'Data Wizard', role: 'analyst', desc: 'Creates deep statistical insights from CSV/SQL.', price: 'Free', emoji: '📊' },
            { name: 'UX Reviewer', role: 'design', desc: 'Critiques UI/UX flows and suggests improvements.', price: 'Premium', emoji: '🎨' },
            { name: 'DevOps Master', role: 'devops', desc: 'Configures CI/CD pipelines and Docker compose.', price: 'Free', emoji: '🚀' },
            { name: 'Security Aud', role: 'security', desc: 'Runs static analysis to find vulnerabilities.', price: 'Premium', emoji: '🔐' },
          ].map((specialist, idx) => (
            <div key={idx} className="mc-card p-6 flex flex-col gap-4 hover:border-mc-accent/40 transition-all duration-500">
              <div className="flex items-center justify-between border-b border-mc-border/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-mc-bg border border-mc-border flex items-center justify-center text-2xl shadow-sm">
                    {specialist.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-mc-text tracking-tight text-sm">{specialist.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-mc-accent">{specialist.role}</span>
                  </div>
                </div>
                {specialist.price === 'Premium' ? (
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-wider">Premium</span>
                ) : (
                  <span className="text-[9px] font-bold text-mc-accent-green bg-mc-accent-green/10 px-2 py-1 rounded-full uppercase tracking-wider">Free</span>
                )}
              </div>
              <p className="text-xs text-mc-text-secondary leading-relaxed flex-1">
                {specialist.desc}
              </p>
              <button 
                className="w-full py-2 bg-mc-accent/10 hover:bg-mc-accent text-mc-accent hover:text-white transition-colors duration-300 rounded-lg text-[10px] font-bold uppercase tracking-widest mt-auto shadow-sm"
              >
                Hire Specialist
              </button>
            </div>
          ))}
          
          <div className="mc-card border-dashed p-6 flex flex-col items-center justify-center gap-3 text-mc-text-secondary hover:border-mc-accent/40 hover:bg-mc-accent/5 transition-all w-full min-h-[220px]">
            <Plus className="w-8 h-8 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest text-center">Develop Custom<br/>Specialist</span>
          </div>
        </div>
      )}

    </div>
  );
}
