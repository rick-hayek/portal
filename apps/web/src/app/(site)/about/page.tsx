import siteConfig from '@/site.config';

export const metadata = {
    title: `About — ${siteConfig.site.title}`,
    description: siteConfig.about?.bio ?? siteConfig.site.description,
};

export default function AboutPage() {
    const about = siteConfig.about ?? {};
    const { name, bio, avatar, skills, socialLinks } = about as {
        name?: string;
        bio?: string;
        avatar?: string;
        skills?: string[];
        socialLinks?: { label: string; href: string; icon?: string }[];
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {/* Hero */}
            <section className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                {avatar && (
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[var(--portal-color-primary)]">
                        <img
                            src={avatar}
                            alt={name ?? siteConfig.site.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-[var(--portal-color-text)]">
                        {name ?? siteConfig.site.title}
                    </h1>
                    {bio && (
                        <p className="mt-2 leading-relaxed text-[var(--portal-color-text-secondary)]">
                            {bio}
                        </p>
                    )}
                </div>
            </section>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
                <section className="mb-12">
                    <h2 className="mb-4 text-xl font-semibold text-[var(--portal-color-text)]">Social</h2>
                    <div className="flex flex-wrap gap-3">
                        {socialLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-2 text-sm transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
                            >
                                {link.icon && <span>{link.icon}</span>}
                                {link.label}
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-[var(--portal-color-text)]">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="rounded-full bg-[var(--portal-color-primary)] px-3 py-1 text-xs font-medium text-white transition-transform hover:scale-105"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
