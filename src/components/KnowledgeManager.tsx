'use client';

import React, { useState } from 'react';
import { KnowledgeUploader } from './KnowledgeUploader';
import { 
  Database, Search, FileText, Globe, Link as LinkIcon, 
  MoreVertical, Trash2, ShieldCheck, Zap 
} from 'lucide-react';

const mockKnowledge = [
  { id: '1', title: 'OpenClaw Documentation v1.4', type: 'pdf', size: '2.4MB', date: '2 hours ago', status: 'vectorized' },
  { id: '2', title: 'https://docs.anthropic.com', type: 'url', size: '42 pages', date: '1 day ago', status: 'indexed' },
  { id: '3', title: 'Project Orion Design Specs', type: 'text', size: '12KB', date: '3 days ago', status: 'vectorized' },
];

export function KnowledgeManager() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      
      {/* Search and Upload Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="mc-card p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-4">Ingestion Engine</h3>
          <KnowledgeUploader />
        </div>

        <div className="mc-card p-6 bg-mc-bg-tertiary/20">
           <h3 className="text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-4">Memory Statistics</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-mc-text-secondary">Vector Count</span>
                <span className="text-mc-text font-mono font-bold">12,482</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-mc-text-secondary">Store size</span>
                <span className="text-mc-text font-mono font-bold">480 MB</span>
              </div>
              <div className="w-full h-1.5 bg-mc-bg rounded-full overflow-hidden">
                <div className="h-full bg-mc-accent" style={{width: '65%'}}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Knowledge Library Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-text-secondary opacity-50" />
            <input 
              type="text" 
              placeholder="Search knowledge base..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mc-input !pl-10 !rounded-2xl"
            />
          </div>
          <button className="mc-button-secondary !py-2.5 !px-5 !rounded-2xl flex items-center gap-2">
            <Database className="w-4 h-4" /> Sync Store
          </button>
        </div>

        <div className="space-y-3">
          {mockKnowledge.map((item) => (
            <div key={item.id} className="mc-card p-4 hover:bg-mc-bg-tertiary/30 group transition-all duration-300 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-mc-bg rounded-xl flex items-center justify-center border border-mc-border/40 group-hover:scale-105 group-hover:bg-mc-accent group-hover:text-white transition-all">
                  {item.type === 'pdf' ? <FileText className="w-5 h-5" /> : item.type === 'url' ? <Globe className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-mc-text group-hover:text-mc-accent transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-mc-text-secondary uppercase font-semibold opacity-60">{item.type} • {item.size}</span>
                    <span className="text-[10px] text-mc-text-secondary opacity-30">•</span>
                    <span className="text-[10px] text-mc-text-secondary opacity-60">{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-mc-accent-green/10 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-mc-accent-green" />
                  <span className="text-[9px] font-bold uppercase text-mc-accent-green tracking-wider">{item.status}</span>
                </div>
                <button className="p-1.5 hover:bg-mc-bg rounded-lg text-mc-text-secondary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-center gap-4 pt-4">
           <p className="text-[10px] font-bold uppercase tracking-widest text-mc-text-secondary opacity-40 flex items-center gap-2">
             <Zap className="w-3 h-3 text-mc-accent" />
             Vector Engine: ChromaDB // OpenAI Embeddings v3
           </p>
        </div>
      </div>

    </div>
  );
}
