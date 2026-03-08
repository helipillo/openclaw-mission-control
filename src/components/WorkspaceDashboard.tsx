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
    <div className="min-h-screen bg-mc-bg selection:bg-mc-accent/30 tracking-tight font-sans">
      {/* Ultra Subtle Background Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mc-bg-secondary/40 via-mc-bg to-mc-bg" />

      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50">
        <div className="glass-effect rounded-[1.5rem] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[0.8rem] flex items-center justify-center text-lg bg-mc-bg-tertiary border border-mc-border shadow-sm">🦞</div>
            <h1 className="text-lg font-semibold tracking-tight text-mc-text">Mission Control</h1>
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
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-3 tracking-tight text-mc-text">
            Workspaces
          </h2>
          <p className="text-mc-text-secondary max-w-2xl font-light">
            Orchestrate your autonomous agent fleet. 
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
              className="mc-card border-dashed border-2 border-mc-border/60 hover:border-mc-accent/30 hover:bg-mc-bg-tertiary transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[220px] group shadow-none"
            >
              <div className="icon-box !w-12 !h-12 !rounded-[1rem] bg-mc-bg text-mc-text-secondary group-hover:text-mc-accent group-hover:bg-mc-bg transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-mc-text-secondary font-medium text-sm tracking-wide uppercase">New Fleet</span>
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
      <div className="mc-card group relative min-h-[220px] flex flex-col justify-between hover:bg-mc-bg-tertiary">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="icon-box !rounded-[1rem] group-hover:scale-105 group-hover:bg-mc-bg transition-all">
              <span className="text-xl">{workspace.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-mc-text transition-colors tracking-tight">
                {workspace.name}
              </h3>
              <p className="text-xs font-mono text-mc-text-secondary opacity-70">/{workspace.slug}</p>
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
                className="p-1.5 rounded-lg hover:bg-mc-accent-red/10 text-mc-text-secondary hover:text-mc-accent-red transition-all opacity-0 group-hover:opacity-100"
                title="Delete workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-mc-text-secondary group-hover:bg-mc-bg group-hover:text-mc-text transition-all duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-2 mt-6">
          <div className="px-3 py-1.5 bg-mc-bg rounded-lg flex items-center gap-1.5 text-[10px] uppercase font-bold text-mc-text-secondary border border-mc-border/40">
            <CheckSquare className="w-3 h-3 text-mc-accent-green" />
            <span>{workspace.taskCounts.total} Missions</span>
          </div>
          <div className="px-3 py-1.5 bg-mc-bg rounded-lg flex items-center gap-1.5 text-[10px] uppercase font-bold text-mc-text-secondary border border-mc-border/40">
            <Users className="w-3 h-3 text-mc-accent" />
            <span>{workspace.agentCount} Agents</span>
          </div>
        </div>
      </div>
    </Link>

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-mc-bg/60 backdrop-blur-3xl flex items-end sm:items-center justify-center z-[100] p-4" onClick={() => setShowDeleteConfirm(false)}>
        <div className="glass-effect rounded-[2rem] w-full max-w-md p-6 sm:p-8 animate-slide-in" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="p-4 bg-mc-accent-red/10 rounded-full mb-2">
              <AlertTriangle className="w-8 h-8 text-mc-accent-red" />
            </div>
            <h3 className="font-semibold text-xl text-mc-text">Delete Workspace</h3>
            <p className="text-sm text-mc-text-secondary">This action cannot be undone.</p>
          </div>
          
          <div className="text-mc-text-secondary mb-8 text-center bg-mc-bg-tertiary p-4 rounded-2xl text-sm">
            Are you sure you want to delete <strong>{workspace.name}</strong>? 
            {workspace.taskCounts.total > 0 && (
              <span className="block mt-2 text-mc-accent-red">
                ⚠️ This workspace has {workspace.taskCounts.total} task(s). Delete them first.
              </span>
            )}
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="mc-button-secondary w-full sm:w-auto justify-center"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || workspace.taskCounts.total > 0 || workspace.agentCount > 0}
              className="px-5 py-2.5 bg-mc-accent-red text-white rounded-full font-medium hover:brightness-110 disabled:opacity-50 w-full sm:w-auto transition-all shadow-sm"
            >
              {deleting ? 'Deleting...' : 'Delete'}
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
    <div className="fixed inset-0 bg-mc-bg/60 backdrop-blur-3xl flex items-end sm:items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="glass-effect rounded-[2rem] w-full max-w-md shadow-2xl animate-slide-in overflow-hidden border-mc-border/20">
        <div className="p-6 sm:p-8 flex flex-col items-center text-center border-b border-mc-border/10">
          <div className="w-12 h-12 bg-mc-bg-tertiary rounded-2xl flex items-center justify-center mb-4">
            <Folder className="w-6 h-6 text-mc-text-secondary" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">New Workspace</h2>
          <p className="text-sm text-mc-text-secondary mt-1">Configure your orchestration layer.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Icon selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-3">Identifier Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all duration-300 ${
                    icon === i 
                      ? 'bg-mc-bg shadow-sm ring-1 ring-mc-border' 
                      : 'hover:bg-mc-bg-tertiary focus:outline-none opacity-60 hover:opacity-100'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-3">Workspace Name</label>
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
            <div className="text-mc-accent-red text-xs font-medium p-3 bg-mc-accent-red/5 border border-mc-accent-red/10 rounded-xl">{error}</div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-mc-border/10">
            <button
              type="button"
              onClick={onClose}
              className="mc-button-secondary w-full sm:w-auto justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="mc-button-primary w-full sm:w-auto justify-center"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
