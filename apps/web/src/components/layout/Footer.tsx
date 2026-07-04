interface FooterProps {
  siteTitle: string;
}

export function Footer({ siteTitle }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--portal-color-border)] flex justify-center px-4 md:px-8">
      <div className="flex w-full items-center justify-between py-6 px-0">
        <p className="text-[0.75rem] text-[var(--portal-color-text-secondary)]">
          © {currentYear} {siteTitle}. Built with Next.js & tRPC.
        </p>
        <div className="flex gap-6">
          <a
            target="blank"
            href={`${process.env.NEXT_PUBLIC_GITHUB_URL}`}
            className="text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
          >
            GitHub
          </a>
          {/* <a href="#" className="text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]">Twitter</a> */}
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
            className="text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
