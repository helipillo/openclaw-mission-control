'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  BackgroundVariant,
  Controls, 
  Connection, 
  Edge, 
  Node, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMissionControl } from '@/lib/store';
import { Bot, CheckSquare, Zap, Loader2, MousePointer2, Plus } from 'lucide-react';
import { TaskModal } from './TaskModal';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Custom node types for Agents and Tasks
const nodeTypes = {
  agent: AgentNode,
  task: TaskNode,
};

function AgentNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 rounded-2xl bg-mc-bg-secondary border border-mc-accent/30 shadow-lg min-w-[180px] glass-effect-heavy animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-mc-accent/10 border border-mc-accent/20 flex items-center justify-center text-xl">
          {data.emoji || '🤖'}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-mc-accent opacity-70">Agent</div>
          <div className="text-sm font-bold text-mc-text">{data.label}</div>
        </div>
      </div>
    </div>
  );
}

function TaskNode({ data }: { data: any }) {
  const statusColors: any = {
    'done': 'border-mc-accent-green bg-mc-accent-green/5',
    'in_progress': 'border-mc-accent bg-mc-accent/5',
    'planning': 'border-mc-accent-purple bg-mc-accent-purple/5',
    'failed': 'border-mc-accent-red bg-mc-accent-red/5',
    'inbox': 'border-mc-border bg-mc-bg-tertiary/50'
  };

  return (
    <div className={`px-4 py-3 rounded-2xl border ${statusColors[data.status] || 'border-mc-border'} shadow-md min-w-[200px] glass-effect animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <CheckSquare className="w-4 h-4 text-mc-text opacity-50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
             <div className="text-[9px] font-bold uppercase tracking-widest text-mc-text-secondary opacity-60">Task</div>
             <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'in_progress' ? 'bg-mc-accent animate-pulse' : 'bg-transparent'}`}></div>
          </div>
          <div className="text-xs font-semibold text-mc-text truncate">{data.label}</div>
          <div className="mt-1 text-[10px] text-mc-text-secondary line-clamp-1 opacity-70">{data.status}</div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowCanvas() {
  const { agents, tasks, isLoading } = useMissionControl();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [editingTask, setEditingTask] = useState<any>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'task') {
      const taskId = node.id.replace('task-', '');
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setEditingTask(task);
      }
    }
  }, [tasks]);

  // Sync state from Mission Control store
  useEffect(() => {
    if (isLoading) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Layout config (simple horizontal split for now)
    const AGENT_X = 100;
    const TASK_X = 500;
    const Y_SPACING = 120;

    // Add Agent Nodes
    agents.forEach((agent, index) => {
      newNodes.push({
        id: `agent-${agent.id}`,
        type: 'agent',
        position: { x: AGENT_X, y: 50 + index * Y_SPACING },
        data: { label: agent.name, emoji: agent.avatar_emoji },
      });
    });

    // Add Task Nodes
    tasks.forEach((task, index) => {
      newNodes.push({
        id: `task-${task.id}`,
        type: 'task',
        position: { x: TASK_X, y: 50 + index * Y_SPACING },
        data: { label: task.title, status: task.status },
      });

      // Create edge if task is assigned to an agent
      if (task.assigned_agent_id) {
        newEdges.push({
          id: `edge-${task.id}`,
          source: `agent-${task.assigned_agent_id}`,
          target: `task-${task.id}`,
          animated: task.status === 'in_progress' || task.status === 'planning',
          style: { stroke: task.status === 'in_progress' ? 'var(--mc-accent)' : '#94a3b8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: task.status === 'in_progress' ? 'var(--mc-accent)' : '#94a3b8',
          },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [agents, tasks, isLoading, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-mc-bg opacity-50">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-mc-accent" />
        <p className="text-mc-text-secondary font-medium uppercase tracking-widest text-xs">Calibrating Visual Core...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-mc-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="workflow-canvas"
      >
        <Background color="rgba(148, 163, 184, 0.1)" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} className="mc-controls glass-effect rounded-2xl border-mc-border overflow-hidden" />
        
        <Panel position="top-right" className="p-4">
          <div className="glass-effect rounded-[1.2rem] p-4 border border-mc-border/40 shadow-xl flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
               <Zap className="w-4 h-4 text-mc-accent" />
               <span className="text-xs font-bold uppercase tracking-wider text-mc-text">Visual Orchestrator</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] text-mc-text-secondary font-medium">
                <span>Active Agents</span>
                <span className="text-mc-text">{agents.length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-mc-text-secondary font-medium">
                <span>Live Missions</span>
                <span className="text-mc-text">{tasks.filter(t => t.status !== 'done').length}</span>
              </div>
            </div>
            <div className="border-t border-mc-border/20 pt-3 flex gap-2">
               <button className="mc-button-secondary !py-2 flex-1 text-[10px] uppercase font-bold">
                 <MousePointer2 className="w-3 h-3" /> Select
               </button>
               <button className="mc-button-primary !py-2 flex-1 text-[10px] uppercase font-bold">
                 <Plus className="w-3 h-3" /> New Task
               </button>
            </div>
          </div>
        </Panel>

        <Panel position="top-left" className="p-4">
           <div className="text-mc-text-secondary/30 text-[10px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-lr] hover:text-mc-accent transition-colors">
             Mission Control // Workflow Canvas v1.0
           </div>
        </Panel>
      </ReactFlow>

      {editingTask && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
        />
      )}

      <style jsx global>{`
        .react-flow__handle {
          width: 8px;
          height: 8px;
          background: var(--mc-accent);
          border: 2px solid white;
        }
        .react-flow__controls-button {
          background: transparent !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1) !important;
          color: var(--mc-text-secondary) !important;
        }
        .react-flow__controls-button:hover {
          background: var(--mc-bg-tertiary) !important;
          color: var(--mc-text) !important;
        }
        .react-flow__panel {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
