interface FooterProps {
    siteTitle: string;
    socialLinks?: { label: string; href: string; icon?: string }[];
}

export function Footer({ siteTitle, socialLinks = [] }: FooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
                {/* Copyright */}
                <p className="text-sm text-[var(--portal-color-text-secondary)]">
                    &copy; {year} {siteTitle}. All rights reserved.
                </p>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                    <nav className="flex items-center gap-3" aria-label="Social links">
                        {socialLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
                                aria-label={link.label}
                            >
                                {link.icon && <span className="mr-1">{link.icon}</span>}
                                {link.label}
                            </a>
                        ))}
                    </nav>
                )}
            </div>
        </footer>
    );
}
