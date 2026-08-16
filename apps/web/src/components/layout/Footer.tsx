import { Github, Mail, Rss } from 'lucide-react';
import siteConfig from '@/site.config';

interface FooterProps {
  siteTitle: string;
}

export function Footer({ siteTitle }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const xUrl = process.env.NEXT_PUBLIC_X_URL;
  const isMetro = siteConfig.homeLayout === 'metro';

  // Dynamic style tokens based on layout mode
  const footerBgClass = isMetro
    ? 'bg-[#0c0f0f] border-t-2 border-[#333535]'
    : 'border-t border-[var(--portal-color-border)]';

  const textBaseClass = isMetro
    ? 'text-xs font-mono text-[#9c8f78]'
    : 'text-[0.75rem] text-[var(--portal-color-text-secondary)]';

  const titleClass = isMetro
    ? 'font-extrabold text-[#e2e2e2] tracking-wider uppercase mr-2'
    : 'font-extrabold text-[var(--portal-color-text-primary)] tracking-wider uppercase mr-2';

  const linkClass = isMetro
    ? 'flex items-center gap-1.5 text-[#9c8f78] hover:text-[#00e3fd] transition-colors no-underline uppercase'
    : 'flex items-center gap-1.5 text-[0.75rem] font-medium text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)] no-underline';

  return (
    <footer className={`w-full flex justify-center ${footerBgClass} mt-auto`}>
      <div className={`flex w-full items-center justify-between py-6 gap-4 ${isMetro ? 'max-w-[1400px] mx-auto px-4 sm:px-8' : 'px-4 md:px-8'} ${textBaseClass}`}>
        <div className="flex items-center gap-2">

          <span>
            © {currentYear} {siteTitle}.<span className="hidden sm:inline"> Built with Next.js & tRPC.</span>
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com'}`}
            aria-label="GitHub"
            className={linkClass}
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          {xUrl && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={xUrl}
              aria-label="X"
              className={linkClass}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="hidden sm:inline">X</span>
            </a>
          )}
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || ''}`}
            aria-label="Email"
            className={linkClass}
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="/feed.xml"
            aria-label="RSS"
            className={linkClass}
          >
            <Rss className="h-4 w-4" />
            <span className="hidden sm:inline">RSS</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
