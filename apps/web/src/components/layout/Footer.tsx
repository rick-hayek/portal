import { Github, Mail, Rss } from 'lucide-react';

interface FooterProps {
  siteTitle: string;
}

export function Footer({ siteTitle }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--portal-color-border)] flex justify-center px-4 md:px-8">
      <div className="flex w-full items-center justify-between py-6 px-0">
        <p className="text-[0.75rem] text-[var(--portal-color-text-secondary)]">
          © {currentYear} {siteTitle}.
          <span className="hidden sm:inline"> Built with Next.js & tRPC.</span>
        </p>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${process.env.NEXT_PUBLIC_GITHUB_URL}`}
            aria-label="GitHub"
            className="flex items-center gap-1.5 text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
            aria-label="Email"
            className="flex items-center gap-1.5 text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="/feed.xml"
            aria-label="RSS"
            className="flex items-center gap-1.5 text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
          >
            <Rss className="h-4 w-4" />
            <span className="hidden sm:inline">RSS</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
