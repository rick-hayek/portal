import type { SiteConfig } from '@portal/shared';

// ──────────────────────────────────────────────
// 5 Configuration Presets
// ──────────────────────────────────────────────

export type PresetName = 'minimal' | 'tech-blog' | 'creative' | 'full' | 'devtools';

/** Preset → list of modules to enable */
const presetModules: Record<PresetName, string[]> = {
    minimal: ['about', 'links'],
    'tech-blog': ['blog', 'about', 'search', 'analytics', 'links'],
    creative: ['portfolio', 'gallery', 'about', 'guestbook'],
    full: [
        'blog',
        'portfolio',
        'resume',
        'gallery',
        'guestbook',
        'links',
        'about',
        'tools',
        'analytics',
        'search',
    ],
    devtools: ['tools', 'blog', 'search', 'analytics'],
};

/** Preset → recommended default theme */
const presetThemes: Record<PresetName, string> = {
    minimal: 'minimal-light',
    'tech-blog': 'minimal-light',
    creative: 'dark-neon',
    full: 'minimal-light',
    devtools: 'dark-neon',
};

/**
 * Given a preset name, return the SiteConfig.modules map
 * with each preset module set to `{ enabled: true }`.
 */
export function getPresetModules(
    preset: PresetName,
): Record<string, { enabled: boolean }> {
    const modules: Record<string, { enabled: boolean }> = {};
    for (const mod of presetModules[preset]) {
        modules[mod] = { enabled: true };
    }
    return modules;
}

/**
 * Merge preset defaults into a partial SiteConfig.
 * Explicit user values always override preset defaults.
 */
export function applyPreset(
    config: Partial<SiteConfig> & { preset?: PresetName },
): Partial<SiteConfig> {
    if (!config.preset) return config;

    const preset = config.preset;
    const presetMods = getPresetModules(preset);
    const defaultThemeId = presetThemes[preset];

    return {
        ...config,
        modules: { ...presetMods, ...config.modules },
        theme: {
            default: defaultThemeId,
            available: [
                'minimal-light',
                'dark-neon',
                'cyberpunk',
                'nature-green',
                'retro-brown',
            ],
            allowUserSwitch: true,
            ...config.theme,
        },
    };
}
