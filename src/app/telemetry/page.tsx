'use client';

import { Header } from '@/components/Header';
import { TelemetryDashboard } from '@/components/TelemetryDashboard';

export default function TelemetryPage() {
  return (
    <div className="flex flex-col h-screen bg-mc-bg overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-mc-bg-secondary/30 p-4 md:p-8 scrollbar-hide">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-mc-text">Live Telemetry</h1>
            <p className="text-mc-text-secondary">Real-time performance metrics and resource utilization across all fleets.</p>
          </div>
          
          <TelemetryDashboard />
        </div>
      </main>
    </div>
  );
}
