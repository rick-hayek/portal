import type { SiteConfig } from '@portal/shared';
import { applyPreset } from './presets';
import { type SiteConfigInput, siteConfigSchema } from './schema';

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
export * from './defaultAbout';
export * from './defaultModules';
export {
  clearRegistry,
  getAllModules,
  getEnabledModules,
  getModule,
  getNavItems,
  registerModule,
} from './moduleRegistry';
export { applyPreset, getPresetModules, type PresetName } from './presets';
export * from './resume';
export { type SiteConfigInput, type SiteConfigParsed, siteConfigSchema } from './schema';
