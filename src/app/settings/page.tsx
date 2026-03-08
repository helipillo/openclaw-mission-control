/**
 * Settings Page
 * Configure Mission Control paths, URLs, and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, RotateCcw, Home, FolderOpen, Link as LinkIcon, Palette } from 'lucide-react';
import { getConfig, updateConfig, resetConfig, type MissionControlConfig, type Theme } from '@/lib/config';
import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const [config, setConfig] = useState<MissionControlConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      updateConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetConfig();
      setConfig(getConfig());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleChange = (field: keyof MissionControlConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    
    // If theme changes, apply it immediately
    if (field === 'theme') {
      setTheme(value as Theme);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-mc-text-secondary">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mc-bg tracking-tight font-sans">
      {/* Background Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mc-bg-secondary/40 via-mc-bg to-mc-bg" />

      {/* Floating Header */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50">
        <div className="glass-effect rounded-[1.5rem] px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-xl bg-mc-bg-tertiary flex items-center justify-center hover:bg-mc-bg transition-colors"
              title="Back"
            >
              <Home className="w-5 h-5 text-mc-text-secondary" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-mc-text leading-none tracking-tight">Settings</h1>
              <p className="text-xs text-mc-text-secondary mt-1 font-medium uppercase tracking-wider">System Core</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="mc-button-secondary py-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mc-button-primary py-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded text-green-400">
            ✓ Settings saved successfully
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400">
            ✗ {error}
          </div>
        )}

        {/* Workspace Paths */}
        <section className="mb-8 p-6 mc-card shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-mc-bg flex items-center justify-center border border-mc-border/40 shadow-sm">
              <FolderOpen className="w-4 h-4 text-mc-text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-mc-text">Workspace Paths</h2>
              <p className="text-xs text-mc-text-secondary font-medium">Configure where Mission Control stores deliverables.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-2">
                Workspace Base Path
              </label>
              <input
                type="text"
                value={config.workspaceBasePath}
                onChange={(e) => handleChange('workspaceBasePath', e.target.value)}
                placeholder="~/Documents/Shared"
                className="mc-input"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                Base directory for all Mission Control files. Use ~ for home directory.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-2">
                Projects Path
              </label>
              <input
                type="text"
                value={config.projectsPath}
                onChange={(e) => handleChange('projectsPath', e.target.value)}
                placeholder="~/Documents/Shared/projects"
                className="mc-input"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                Directory where project folders are created. Each project gets its own folder.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-2">
                Default Project Name
              </label>
              <input
                type="text"
                value={config.defaultProjectName}
                onChange={(e) => handleChange('defaultProjectName', e.target.value)}
                placeholder="mission-control"
                className="mc-input"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                Default name for new projects. Can be changed per project.
              </p>
            </div>
          </div>
        </section>

        {/* Appearance Configuration */}
        <section className="mb-8 p-6 mc-card shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-mc-bg flex items-center justify-center border border-mc-border/40 shadow-sm">
              <Palette className="w-4 h-4 text-mc-text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-mc-text">Appearance</h2>
              <p className="text-xs text-mc-text-secondary font-medium">Customize your visual experience.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-mc-text-secondary mb-2">
                Theme
              </label>
              <select
                value={config.theme}
                onChange={(e) => handleChange('theme', e.target.value as Theme)}
                className="mc-input"
              >
                <option value="original">Original (Dark)</option>
                <option value="latte">Catppuccin Latte (Light)</option>
                <option value="mocha">Catppuccin Mocha (Dark)</option>
              </select>
              <p className="text-xs text-mc-text-secondary mt-1">
                Select your preferred color theme. Changes are applied immediately but must be saved to persist.
              </p>
            </div>
          </div>
        </section>

        {/* API Configuration */}
 
        {/* Environment Variables Note */}
        <section className="p-8 bg-mc-bg-tertiary/30 border border-mc-border/30 rounded-[1.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-105 transition-transform duration-700">
            <Settings className="w-32 h-32" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-mc-text mb-2 flex items-center gap-2">
             Environment Variables
          </h3>
          <p className="text-sm text-mc-text-secondary mb-6 font-light">
            Infrastructure logic defaults are sourced from <code className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono border border-mc-border/40">.env.local</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'MISSION_CONTROL_URL',
              'WORKSPACE_BASE_PATH',
              'PROJECTS_PATH',
              'OPENCLAW_GATEWAY_URL',
              'OPENCLAW_GATEWAY_TOKEN'
            ].map(v => (
              <div key={v} className="flex items-center gap-3 text-sm text-mc-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-mc-accent" />
                <code className="font-mono">{v}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-mc-text-secondary mt-8 font-medium italic">
            * Environment variables override UI settings for server-side logic.
          </p>
        </section>
      </div>
    </div>
  );
}
