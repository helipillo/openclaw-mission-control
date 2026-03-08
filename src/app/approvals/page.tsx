'use client';

import { Header } from '@/components/Header';
import { ApprovalCenter } from '@/components/ApprovalCenter';

export default function ApprovalsPage() {
  return (
    <div className="flex flex-col h-screen bg-mc-bg overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-mc-bg-secondary/30 p-4 md:p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-mc-text">Approval Center</h1>
            <p className="text-mc-text-secondary">Review and authorize high-impact agent actions or clarify mission objectives.</p>
          </div>
          
          <ApprovalCenter />
        </div>
      </main>
    </div>
  );
}
