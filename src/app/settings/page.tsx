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
    <div className="min-h-screen bg-mc-bg">
      {/* Header */}
      <div className="border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-mc-bg-tertiary rounded text-mc-text-secondary"
              title="Back to Mission Control"
            >
              ← Back
            </button>
            <Settings className="w-6 h-6 text-mc-accent" />
            <h1 className="text-2xl font-bold text-mc-text">Settings</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="mc-button-secondary"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mc-button-primary"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
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
        <section className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            📝 Environment Variables
          </h3>
          <p className="text-sm text-blue-300 mb-3">
            Some settings are also configurable via environment variables in <code className="px-2 py-1 bg-mc-bg rounded">.env.local</code>:
          </p>
          <ul className="text-sm text-blue-300 space-y-1 ml-4 list-disc">
            <li><code>MISSION_CONTROL_URL</code> - API URL override</li>
            <li><code>WORKSPACE_BASE_PATH</code> - Base workspace directory</li>
            <li><code>PROJECTS_PATH</code> - Projects directory</li>
            <li><code>OPENCLAW_GATEWAY_URL</code> - Gateway WebSocket URL</li>
            <li><code>OPENCLAW_GATEWAY_TOKEN</code> - Gateway auth token</li>
          </ul>
          <p className="text-xs text-blue-400 mt-3">
            Environment variables take precedence over UI settings for server-side operations.
          </p>
        </section>
      </div>
    </div>
  );
}
