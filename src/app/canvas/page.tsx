'use client';

import { Header } from '@/components/Header';
import { WorkflowCanvas } from '@/components/WorkflowCanvas';

export default function CanvasPage() {
  return (
    <div className="flex flex-col h-screen bg-mc-bg overflow-hidden">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        <WorkflowCanvas />
      </main>
    </div>
  );
}
