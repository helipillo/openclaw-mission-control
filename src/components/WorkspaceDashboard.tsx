'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowRight, Folder, Users, CheckSquare, Trash2, AlertTriangle, Activity } from 'lucide-react';
import Link from 'next/link';
import type { WorkspaceStats } from '@/lib/types';

export function WorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState<WorkspaceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces?stats=true');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🦞</div>
          <p className="text-mc-text-secondary">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mc-bg selection:bg-mc-accent/30 tracking-tight">
      {/* Dynamic Background Blob */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-mc-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] bg-mc-accent-purple/10 blur-[100px] rounded-full animate-pulse-soft" />
      </div>

      {/* Floating Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
        <div className="glass-effect rounded-[2rem] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-mc-accent/20 rounded-2xl flex items-center justify-center text-xl shadow-inner">🦞</div>
            <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-mc-text to-mc-text-secondary">Mission Control</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={workspaces.length > 0 ? `/workspace/${workspaces[0].slug}/activity` : '/workspace/default/activity'}
              className="mc-button-secondary py-2 text-sm"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mc-button-primary py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Workspace</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Workspaces
          </h2>
          <p className="text-lg text-mc-text-secondary max-w-2xl">
            Liquid orchestration for your agent fleet. 
          </p>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-16 h-16 mx-auto text-mc-text-secondary mb-4" />
            <h3 className="text-lg font-medium mb-2">No workspaces yet</h3>
            <p className="text-mc-text-secondary mb-6">
              Create your first workspace to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-mc-accent text-mc-bg rounded-lg font-medium hover:bg-mc-accent/90"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workspaces.map((workspace) => (
              <WorkspaceCard 
                key={workspace.id} 
                workspace={workspace} 
                onDelete={(id) => setWorkspaces(workspaces.filter(w => w.id !== id))}
              />
            ))}
            
            {/* Add workspace card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="border-4 border-dashed border-mc-border/40 rounded-[2.5rem] p-8 hover:border-mc-accent/40 hover:bg-mc-accent/5 transition-all duration-500 flex flex-col items-center justify-center gap-4 min-h-[220px] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-mc-bg-tertiary flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                <Plus className="w-8 h-8 text-mc-text-secondary group-hover:text-mc-accent" />
              </div>
              <span className="text-mc-text-secondary font-bold text-lg">New Fleet</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadWorkspaces();
          }}
        />
      )}
    </div>
  );
}

function WorkspaceCard({ workspace, onDelete }: { workspace: WorkspaceStats; onDelete: (id: string) => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(workspace.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete workspace');
      }
    } catch {
      alert('Failed to delete workspace');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <>
    <Link href={`/workspace/${workspace.slug}`}>
      <div className="mc-card group relative min-h-[220px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="icon-box text-3xl group-hover:scale-110 group-hover:-rotate-12 group-hover:bg-mc-accent/10 group-hover:shadow-[0_0_20px_rgba(30,102,245,0.2)]">
              {workspace.icon}
            </div>
            <div>
              <h3 className="font-bold text-xl group-hover:text-mc-accent transition-colors tracking-tight">
                {workspace.name}
              </h3>
              <p className="text-sm font-mono text-mc-text-secondary opacity-60">/{workspace.slug}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {workspace.id !== 'default' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-2 rounded-xl hover:bg-mc-accent-red/10 text-mc-text-secondary hover:text-mc-accent-red transition-all opacity-0 group-hover:opacity-100"
                title="Delete workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-mc-accent/5 group-hover:bg-mc-accent group-hover:text-mc-bg transition-all duration-500">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Stats Section with Glass Pills */}
        <div className="flex items-center gap-3 mt-6">
          <div className="px-4 py-2 bg-mc-bg-tertiary rounded-2xl flex items-center gap-2 text-xs font-bold border border-mc-border/20">
            <CheckSquare className="w-3.5 h-3.5 text-mc-accent-pink" />
            <span>{workspace.taskCounts.total} MISSION{workspace.taskCounts.total !== 1 ? 'S' : ''}</span>
          </div>
          <div className="px-4 py-2 bg-mc-bg-tertiary rounded-2xl flex items-center gap-2 text-xs font-bold border border-mc-border/20">
            <Users className="w-3.5 h-3.5 text-mc-accent-cyan" />
            <span>{workspace.agentCount} AGENT{workspace.agentCount !== 1 ? 'S' : ''}</span>
          </div>
        </div>
      </div>
    </Link>

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-mc-bg/40 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-4" onClick={() => setShowDeleteConfirm(false)}>
        <div className="glass-effect rounded-[2.5rem] w-full max-w-md p-8 animate-slide-in" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-mc-accent-red/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-mc-accent-red" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Delete Workspace</h3>
              <p className="text-sm text-mc-text-secondary">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-mc-text-secondary mb-6">
            Are you sure you want to delete <strong>{workspace.name}</strong>? 
            {workspace.taskCounts.total > 0 && (
              <span className="block mt-2 text-mc-accent-red">
                ⚠️ This workspace has {workspace.taskCounts.total} task(s). Delete them first.
              </span>
            )}
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-mc-text-secondary hover:text-mc-text"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || workspace.taskCounts.total > 0 || workspace.agentCount > 0}
              className="px-4 py-2 bg-mc-accent-red text-white rounded-lg font-medium hover:bg-mc-accent-red/90 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Workspace'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function CreateWorkspaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icons = ['📁', '💼', '🏢', '🚀', '💡', '🎯', '📊', '🔧', '🌟', '🏠'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create workspace');
      }
    } catch {
      setError('Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mc-bg/40 backdrop-blur-xl flex items-end sm:items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="glass-effect rounded-[3rem] w-full max-w-md shadow-2xl animate-slide-in overflow-hidden">
        <div className="p-8 border-b border-mc-border/20">
          <h2 className="text-2xl font-bold tracking-tight">New Workspace</h2>
          <p className="text-sm text-mc-text-secondary mt-1">Configure your new mission base.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Icon selector */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-mc-text-secondary mb-4">Choose an Emoji</label>
            <div className="flex flex-wrap gap-3">
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all duration-300 ${
                    icon === i 
                      ? 'bg-mc-accent text-mc-bg scale-110 shadow-lg' 
                      : 'bg-mc-bg-tertiary border border-mc-border hover:border-mc-accent focus:outline-none'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-mc-text-secondary mb-4">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Orion Research Lab"
              className="mc-input"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-mc-accent-red text-sm font-medium p-3 bg-mc-accent-red/10 rounded-xl">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mc-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="mc-button-primary"
            >
              {isSubmitting ? 'Creating...' : 'Launch Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
