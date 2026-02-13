import siteConfig from '../../site.config';

export default function HomePage() {
    return (
        <div className="space-y-8">
            <section className="space-y-4 py-12 text-center">
                <h1
                    className="text-4xl font-bold text-[var(--portal-color-text)] sm:text-5xl"
                    style={{ fontFamily: 'var(--portal-font-heading)' }}
                >
                    {siteConfig.site.title}
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-[var(--portal-color-text-secondary)]">
                    {siteConfig.site.description}
                </p>
            </section>

            <section className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 shadow-[var(--portal-shadow)]">
                <h2
                    className="mb-3 text-xl font-semibold text-[var(--portal-color-text)]"
                    style={{ fontFamily: 'var(--portal-font-heading)' }}
                >
                    Welcome
                </h2>
                <p className="text-[var(--portal-color-text-secondary)]">
                    This is <strong>Portal</strong> — a modular, themeable personal website platform.
                    Try switching themes using the selector in the header!
                </p>
            </section>
        </div>
    );
}
