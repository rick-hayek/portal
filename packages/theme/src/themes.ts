import type { ThemeConfig } from '@portal/shared';

export const themes: Record<string, ThemeConfig> = {
  zenith: {
    id: 'zenith',
    name: 'Zenith Ethereal',
    mode: 'light',
    colors: {
      primary: '#536746', // Organic Sage Green
      secondary: '#755754', // Muted Warm Terracotta
      accent: '#98a68e', // Soft Sage Container
      background: '#efefef', // Sanctuary Surface Base (off-white)
      surface: '#ffffff', // Pure White Elevated Card Lift
      surfaceAlt: '#ecefe8', // Surface Nest / Secondary Section
      text: '#191c18', // Soft Charcoal (no pure black)
      textSecondary: '#444841', // Soft Olive Gray / On-surface-variant
      textTertiary: '#74796e', // Muted Olive Outline
      border: '#e1e4db', // Ambient Ghost Border
      error: '#ba1a1a', // Muted Crimson
      success: '#55624d', // Sage Green
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Manrope", system-ui, sans-serif',
      headingFont: '"Manrope", "Plus Jakarta Sans", system-ui, sans-serif',
      monoFont: '"Fira Code", monospace',
      scale: 1,
    },
    spacing: { unit: 4, radius: '1rem' },
    effects: {
      shadow: '0 8px 30px rgba(85, 98, 77, 0.06)',
      blur: '20px',
      transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  'dark-neon': {
    id: 'dark-neon',
    name: 'Dark Neon',
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

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    mode: 'dark',
    colors: {
      primary: '#ff2a6d',
      secondary: '#d300c5',
      accent: '#05d9e8',
      background: '#0d0221',
      surface: '#1a0a2e',
      text: '#f0e7ff',
      textSecondary: '#b8a9d4',
      border: '#2d1b69',
      error: '#ff4757',
      success: '#7bed9f',
    },
    typography: {
      fontFamily: '"Rajdhani", system-ui, sans-serif',
      headingFont: '"Orbitron", system-ui, sans-serif',
      monoFont: '"Share Tech Mono", monospace',
      scale: 1.05,
    },
    spacing: { unit: 4, radius: '0.25rem' },
    effects: {
      shadow: '0 0 20px rgba(255, 42, 109, 0.3), 0 0 40px rgba(5, 217, 232, 0.1)',
      blur: '16px',
      transition: '0.15s ease-out',
    },
  },

  'retro-brown': {
    id: 'retro-brown',
    name: 'Retro Brown',
    mode: 'light',
    colors: {
      primary: '#5c4033',
      secondary: '#8b6914',
      accent: '#c44536',
      background: '#f5f0e8',
      surface: '#fffef9',
      text: '#3c2415',
      textSecondary: '#6b5745',
      border: '#d4c5a9',
      error: '#c44536',
      success: '#588157',
    },
    typography: {
      fontFamily: '"Merriweather", Georgia, serif',
      headingFont: '"Playfair Display SC", Georgia, serif',
      monoFont: '"Courier Prime", monospace',
      scale: 1,
    },
    spacing: { unit: 4, radius: '0.375rem' },
    effects: {
      shadow: '0 1px 4px rgba(92, 64, 51, 0.12)',
      blur: '6px',
      transition: '0.25s ease',
    },
  },

  'minimal-light': {
    id: 'minimal-light',
    name: 'Clean Portal',
    mode: 'light',
    colors: {
      primary: '#6b8ec9', // Soft Blue
      secondary: '#5a7db8', // Darker Blue
      accent: '#10b981', // Green for success/terminal
      background: '#f8f9fb', // Off-white
      surface: '#ffffff', // Pure white
      text: '#111827', // Gray 900
      textSecondary: '#4b5563', // Gray 600
      textTertiary: '#9ca3af', // Gray 400
      border: '#f0f1f3', // Lighter Gray
      surfaceAlt: '#f1f3f7', // Light Gray Surface
      error: '#ef4444',
      success: '#10b981',
    },
    typography: {
      fontFamily: 'var(--font-sora), system-ui, sans-serif',
      headingFont: 'var(--font-sora), system-ui, sans-serif',
      monoFont: 'var(--font-mono), monospace',
      scale: 1,
    },
    spacing: { unit: 4, radius: '0.75rem' },
    effects: {
      shadow: '0 4px 16px rgba(0,0,0,0.05)',
      blur: '12px',
      transition: '0.2s ease',
    },
  },

  lumiere: {
    id: 'lumiere',
    name: 'Lumiere Editorial',
    mode: 'light',
    colors: {
      primary: '#e85d04', // Pure Black – high-impact CTAs & headings
      secondary: '#ff942e', // Primary Container – satin gradient endpoint
      accent: '#1b1b1b', // On-surface – editorial emphasis
      background: '#faf8f5', // Surface base – warm off-white "luxury vellum"
      surface: '#ffffff', // Surface-container-lowest – lifted cards
      surfaceAlt: '#f3f3f3', // Surface-container-low – nested sections
      text: '#1b1b1b', // On-surface – deep charcoal
      textSecondary: '#5e5e5e', // On-surface-variant
      textTertiary: '#9e9e9e', // Outline / metadata labels
      border: 'rgba(198, 198, 198, 0.15)', // Ghost Border at 15% opacity
      error: '#b3261e', // Muted editorial red
      success: '#1b1b1b', // Monochromatic success
    },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
      headingFont: '"Noto Serif", Georgia, serif',
      monoFont: '"IBM Plex Mono", monospace',
      scale: 1,
    },
    spacing: { unit: 4, radius: '0px' },
    effects: {
      shadow: '0 0 40px rgba(27, 27, 27, 0.04)', // Ambient shadow – 4% opacity
      blur: '20px',
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
