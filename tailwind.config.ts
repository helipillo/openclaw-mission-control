import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        'mc-bg': 'var(--mc-bg)',
        'mc-bg-secondary': 'var(--mc-bg-secondary)',
        'mc-bg-tertiary': 'var(--mc-bg-tertiary)',
        'mc-border': 'var(--mc-border)',
        'mc-text': 'var(--mc-text)',
        'mc-text-secondary': 'var(--mc-text-secondary)',
        'mc-accent': 'var(--mc-accent)',
        'mc-accent-green': 'var(--mc-accent-green)',
        'mc-accent-yellow': 'var(--mc-accent-yellow)',
        'mc-accent-red': 'var(--mc-accent-red)',
        'mc-accent-purple': 'var(--mc-accent-purple)',
        'mc-accent-pink': 'var(--mc-accent-pink)',
        'mc-accent-cyan': 'var(--mc-accent-cyan)',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
