import { z } from 'zod';

// ──────────────────────────────────────────────
// Zod Schema for SiteConfig
// ──────────────────────────────────────────────

export const moduleConfigSchema = z
    .object({ enabled: z.boolean() })
    .passthrough();

export const siteConfigSchema = z.object({
    site: z.object({
        title: z.string().min(1),
        description: z.string().default(''),
        url: z.string().url(),
        locale: z.string().default('en-US'),
    }),
    preset: z
        .enum(['minimal', 'tech-blog', 'creative', 'full', 'devtools'])
        .optional(),
    modules: z.record(z.string(), moduleConfigSchema).default({}),
    theme: z
        .object({
            default: z.string().default('minimal-light'),
            available: z
                .array(z.string())
                .default(['minimal-light', 'dark-neon', 'cyberpunk', 'nature-green', 'retro-brown']),
            allowUserSwitch: z.boolean().default(true),
        })
        .default({
            default: 'minimal-light',
            available: ['minimal-light', 'dark-neon', 'cyberpunk', 'nature-green', 'retro-brown'],
            allowUserSwitch: true,
        }),
    admin: z
        .object({
            enabled: z.boolean().default(false),
            basePath: z.string().default('/admin'),
        })
        .default({
            enabled: false,
            basePath: '/admin',
        }),
});

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfigParsed = z.output<typeof siteConfigSchema>;
