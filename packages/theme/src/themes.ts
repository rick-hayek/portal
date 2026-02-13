import type { ThemeConfig } from '@portal/shared';

export const themes: Record<string, ThemeConfig> = {
  'minimal-light': {
    id: 'minimal-light',
    name: '极简白',
    mode: 'light',
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#e94560',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#1a1a2e',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      success: '#22c55e',
    },
    typography: {
      fontFamily: '"Source Serif 4", Georgia, serif',
      headingFont: '"Source Serif 4", Georgia, serif',
      monoFont: '"JetBrains Mono", monospace',
      scale: 1,
    },
    spacing: { unit: 4, radius: '0.5rem' },
    effects: {
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      blur: '8px',
      transition: '0.2s ease',
    },
  },
  'dark-neon': {
    id: 'dark-neon',
    name: '暗夜黑',
    mode: 'dark',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#22d3ee',
      background: '#0f1117',
      surface: '#1a1d2e',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#2d3148',
      error: '#f87171',
      success: '#34d399',
    },
    typography: {
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      headingFont: '"Space Grotesk", system-ui, sans-serif',
      monoFont: '"Fira Code", monospace',
      scale: 1,
    },
    spacing: { unit: 4, radius: '0.75rem' },
    effects: {
      shadow: '0 4px 14px rgba(99, 102, 241, 0.15)',
      blur: '12px',
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
