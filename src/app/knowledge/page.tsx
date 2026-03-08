'use client';

import { Header } from '@/components/Header';
import { KnowledgeManager } from '@/components/KnowledgeManager';

export default function KnowledgePage() {
  return (
    <div className="flex flex-col h-screen bg-mc-bg overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-mc-bg-secondary/30 p-4 md:p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-mc-text">Knowledge Engine</h1>
            <p className="text-mc-text-secondary">Orchestrate long-term memory, vector stores, and RAG context for your fleets.</p>
          </div>
          
          <KnowledgeManager />
        </div>
      </main>
    </div>
  );
}
