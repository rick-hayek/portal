interface FooterProps {
    siteTitle: string;
}

export function Footer({ siteTitle }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-[var(--portal-color-border)] flex justify-center px-8">
            <div className="mx-auto flex w-full items-center justify-between py-6 px-8">
                <p className="text-[0.75rem] text-[var(--portal-color-text-secondary)]">
                    © {currentYear} {siteTitle}. Built with Next.js & tRPC.
                </p>
                <div className="flex gap-6">
                    <a href="#" className="text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]">GitHub</a>
                    {/* <a href="#" className="text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]">Twitter</a> */}
                    <a href="#" className="text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]">Email</a>
                </div>
            </div>
        </footer>
    );
}
