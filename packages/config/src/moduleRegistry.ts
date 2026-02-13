import type { SiteModule, SiteConfig, NavItem } from '@portal/shared';

// ──────────────────────────────────────────────
// Module Registry — central place to track registered modules
// ──────────────────────────────────────────────

const registry = new Map<string, SiteModule>();

/** Register a module definition */
export function registerModule(module: SiteModule): void {
    registry.set(module.id, module);
}

/** Get a registered module by id */
export function getModule(id: string): SiteModule | undefined {
    return registry.get(id);
}

/** Get all registered modules */
export function getAllModules(): SiteModule[] {
    return Array.from(registry.values());
}

/**
 * Get modules that are enabled in the given config.
 * A module is "enabled" if config.modules[id].enabled === true
 * AND the module has been registered.
 */
export function getEnabledModules(config: SiteConfig): SiteModule[] {
    return getAllModules().filter((mod) => {
        const modConfig = config.modules[mod.id];
        return modConfig?.enabled === true;
    });
}

/**
 * Get sorted nav items for all enabled modules.
 * Merges module.navItems, sorted by order (ascending).
 */
export function getNavItems(config: SiteConfig): NavItem[] {
    const enabled = getEnabledModules(config);
    const items: NavItem[] = [];

    for (const mod of enabled) {
        if (mod.navItems) {
            items.push(...mod.navItems);
        }
    }

    return items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Clear the entire registry (useful for tests) */
export function clearRegistry(): void {
    registry.clear();
}
