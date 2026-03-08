'use client';

import React, { useState } from 'react';
import { Upload, Globe, FilePlus, Loader2 } from 'lucide-react';

export function KnowledgeUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Simulate upload
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300
          ${dragActive ? 'border-mc-accent bg-mc-accent/5 scale-[0.98]' : 'border-mc-border/40 hover:border-mc-border hover:bg-mc-bg-tertiary/20'}
          ${uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
      >
        <div className="w-12 h-12 rounded-full bg-mc-bg border border-mc-border flex items-center justify-center shadow-sm">
          {uploading ? <Loader2 className="w-6 h-6 text-mc-accent animate-spin" /> : <Upload className="w-6 h-6 text-mc-text-secondary" />}
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-mc-text">Drop PDFs, TXT, or Code</p>
          <p className="text-[10px] text-mc-text-secondary mt-1">Maximum file size: 50MB</p>
        </div>
      </div>

      <div className="flex items-center gap-3 opacity-50 px-2">
         <div className="h-px bg-mc-border flex-1"></div>
         <span className="text-[9px] font-bold uppercase tracking-widest">OR</span>
         <div className="h-px bg-mc-border flex-1"></div>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-mc-text-secondary px-1">Import from Web</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mc-text-secondary opacity-50" />
            <input 
              type="text" 
              placeholder="https://docs.example.com" 
              className="mc-input !pl-9 !text-xs !py-2"
            />
          </div>
          <button className="mc-button-primary !p-2 !rounded-xl" title="Ingest URL">
            <FilePlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
