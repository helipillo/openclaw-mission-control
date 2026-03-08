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
    <div className="min-h-screen bg-mc-bg tracking-tight">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-mc-accent-green/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-mc-accent/5 blur-[100px] rounded-full" />
      </div>

      {/* Floating Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50">
        <div className="glass-effect rounded-[2.5rem] px-8 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="w-12 h-12 rounded-2xl bg-mc-bg-secondary flex items-center justify-center hover:bg-mc-accent/10 hover:text-mc-accent transition-all group shadow-sm"
              title="Back"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-mc-text leading-none">Settings</h1>
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
        <section className="mb-8 p-6 mc-card">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-mc-accent" />
            <h2 className="text-xl font-semibold text-mc-text">Workspace Paths</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            Configure where Mission Control stores projects and deliverables.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
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
              <label className="block text-sm font-medium text-mc-text mb-2">
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
              <label className="block text-sm font-medium text-mc-text mb-2">
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
        <section className="mb-8 p-6 mc-card">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-mc-accent" />
            <h2 className="text-xl font-semibold text-mc-text">Appearance</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            Customize how Mission Control looks.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Theme
              </label>
              <select
                value={config.theme}
                onChange={(e) => handleChange('theme', e.target.value as Theme)}
                className="mc-input"
              >
                <option value="original">Original (Dark)</option>
                <option value="latte">Catppuccin Latte (Light)</option>
              </select>
              <p className="text-xs text-mc-text-secondary mt-1">
                Select your preferred color theme. Changes are applied immediately but must be saved to persist.
              </p>
            </div>
          </div>
        </section>

        {/* API Configuration */}
 
        {/* Environment Variables Note */}
        <section className="p-8 bg-mc-accent/5 border border-mc-accent/10 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Settings className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold text-mc-accent mb-4 flex items-center gap-2">
            <span>📝</span> Environment Variables
          </h3>
          <p className="text-mc-text-secondary mb-6 leading-relaxed">
            Infrastructure settings are sourced from <code className="px-2 py-1 bg-mc-bg-tertiary rounded-lg font-mono text-mc-accent">.env.local</code>.
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
