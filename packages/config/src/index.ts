import type { SiteConfig } from '@portal/shared';
import { siteConfigSchema, type SiteConfigInput } from './schema';
import { applyPreset } from './presets';

/**
 * Define and validate a site configuration.
 * - If a `preset` is specified, preset defaults are merged first
 * - The result is validated against the Zod schema
 */
export function defineConfig(config: SiteConfigInput): SiteConfig {
  const withPreset = applyPreset(config as Parameters<typeof applyPreset>[0]);
  return siteConfigSchema.parse(withPreset) as SiteConfig;
}

// Re-exports
export type { SiteConfig };
export { siteConfigSchema, type SiteConfigInput, type SiteConfigParsed } from './schema';
export { applyPreset, getPresetModules, type PresetName } from './presets';
export {
  registerModule,
  getModule,
  getAllModules,
  getEnabledModules,
  getNavItems,
  clearRegistry,
} from './moduleRegistry';
export * from './defaultModules';
export * from './resume';

