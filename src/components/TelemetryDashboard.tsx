'use client';

import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useMissionControl } from '@/lib/store';
import { Zap, Activity, DollarSign, Target, Clock, Cpu } from 'lucide-react';

// Mock data for the demonstration
const tokenBurnData = [
  { time: '10:00', tokens: 400, cost: 0.12 },
  { time: '11:00', tokens: 1200, cost: 0.35 },
  { time: '12:00', tokens: 900, cost: 0.28 },
  { time: '13:00', tokens: 2100, cost: 0.62 },
  { time: '14:00', tokens: 1800, cost: 0.54 },
  { time: '15:00', tokens: 2800, cost: 0.85 },
  { time: '16:00', tokens: 3200, cost: 0.96 },
];

const agentPerformance = [
  { name: 'Architect', success: 94, latency: 1.2 },
  { name: 'Researcher', success: 88, latency: 2.1 },
  { name: 'Coder', success: 91, latency: 0.8 },
  { name: 'QA Bot', success: 98, latency: 1.5 },
];

const workspaceDistribution = [
  { name: 'Kronogram', value: 45, color: 'var(--mc-accent)' },
  { name: 'OpenClaw', value: 30, color: 'var(--mc-accent-purple)' },
  { name: 'Legacy', value: 25, color: 'var(--mc-accent-cyan)' },
];

export function TelemetryDashboard() {
  const { agents, tasks } = useMissionControl();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
      
      {/* Top Stats Cards */}
      <div className="mc-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-mc-accent/10 rounded-xl">
            <DollarSign className="w-5 h-5 text-mc-accent" />
          </div>
          <span className="text-[10px] font-bold text-mc-accent-green bg-mc-accent-green/10 px-2 py-0.5 rounded-full">+12% vs last 24h</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-mc-text">$12.42</div>
          <div className="text-xs text-mc-text-secondary uppercase tracking-wider font-semibold opacity-60">Total Running Cost</div>
        </div>
      </div>

      <div className="mc-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-mc-accent-purple/10 rounded-xl">
            <Activity className="w-5 h-5 text-mc-accent-purple" />
          </div>
          <span className="text-[10px] font-bold text-mc-accent-purple bg-mc-accent-purple/10 px-2 py-0.5 rounded-full">Live</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-mc-text">154.2k</div>
          <div className="text-xs text-mc-text-secondary uppercase tracking-wider font-semibold opacity-60">Total Tokens Consumed</div>
        </div>
      </div>

      <div className="mc-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-mc-accent-green/10 rounded-xl">
            <Target className="w-5 h-5 text-mc-accent-green" />
          </div>
          <span className="text-[10px] font-bold text-mc-text-secondary opacity-60">94.8% Success Rate</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-mc-text">{tasks.filter(t => t.status === 'done').length}</div>
          <div className="text-xs text-mc-text-secondary uppercase tracking-wider font-semibold opacity-60">Missions Completed</div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="md:col-span-2 mc-card p-6 min-h-[350px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-mc-accent" />
            <h3 className="font-bold text-mc-text uppercase tracking-widest text-xs">Token Burn Rate (Last 24h)</h3>
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tokenBurnData}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mc-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--mc-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mc-border)" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--mc-text-secondary)', fontSize: 10}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--mc-text-secondary)', fontSize: 10}} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--mc-bg-secondary)', 
                  border: '1px solid var(--mc-border)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(20px)'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="tokens" 
                stroke="var(--mc-accent)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTokens)" 
                animationBegin={300}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mc-card p-6 min-h-[350px]">
        <div className="flex items-center gap-2 mb-8">
          <Cpu className="w-4 h-4 text-mc-accent-purple" />
          <h3 className="font-bold text-mc-text uppercase tracking-widest text-xs">Fleet Distribution</h3>
        </div>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={workspaceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {workspaceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
           {workspaceDistribution.map(ws => (
             <div key={ws.name} className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full" style={{backgroundColor: ws.color}}></div>
               <span className="text-[10px] text-mc-text-secondary font-bold uppercase">{ws.name}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Latency / Performance Table */}
      <div className="md:col-span-3 mc-card p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-mc-accent-cyan" />
          <h3 className="font-bold text-mc-text uppercase tracking-widest text-xs">Agent Efficiency Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-mc-border/40">
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-mc-text-secondary opacity-60">Agent Core</th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-mc-text-secondary opacity-60 text-right">Success Velocity</th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-mc-text-secondary opacity-60 text-right">Avg Latency (s)</th>
                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-mc-text-secondary opacity-60 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mc-border/10">
              {agentPerformance.map(agent => (
                <tr key={agent.name} className="group hover:bg-mc-bg-tertiary/20 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-mc-bg flex items-center justify-center font-bold text-xs text-mc-text border border-mc-border group-hover:bg-mc-accent group-hover:text-white transition-all">
                         {agent.name[0]}
                       </div>
                       <span className="text-sm font-semibold text-mc-text">{agent.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <div className="w-24 h-1.5 bg-mc-bg rounded-full overflow-hidden border border-mc-border">
                          <div className="h-full bg-mc-accent-green" style={{width: `${agent.success}%`}}></div>
                       </div>
                       <span className="text-xs font-mono text-mc-text-secondary">{agent.success}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xs font-mono text-mc-text-secondary">{agent.latency}s</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-mc-accent-green/10 text-mc-accent-green text-[9px] font-bold uppercase">Optimal</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
