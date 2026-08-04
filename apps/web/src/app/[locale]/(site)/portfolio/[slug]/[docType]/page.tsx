import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { MermaidRenderer } from '@/components/blog/MermaidRenderer';
import { SafeMDXRemote } from '@/components/blog/SafeMDXRemote';
import rehypeCustomHighlight from '@/lib/rehype-custom-highlight';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';

export const revalidate = 3600; // ISR validation every hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; docType: string }>;
}) {
  const { slug, docType } = await params;
  if (docType !== 'Privacy_Policy' && docType !== 'Terms_of_Service') {
    return { title: 'Not Found' };
  }

  const trpc = await getTRPCServer();
  const project = await trpc.portfolio.bySlug({ slug });
  if (!project) return { title: 'Not Found' };

  const docTitle = docType === 'Privacy_Policy' ? 'Privacy Policy' : 'Terms of Service';
  return {
    title: `${docTitle} - ${project.title} — ${siteConfig.site.title}`,
  };
}

export default async function ProjectDocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; docType: string }>;
}) {
  const { locale, slug, docType } = await params;

  if (docType !== 'Privacy_Policy' && docType !== 'Terms_of_Service') {
    notFound();
  }

  // Set request locale for static/ISR rendering in next-intl
  setRequestLocale(locale);

  const trpc = await getTRPCServer();
  const project = await trpc.portfolio.bySlug({ slug });
  if (!project) {
    notFound();
  }

  const baseContent = docType === 'Privacy_Policy' ? project.privacyPolicy : project.termsOfService;
  const enContent =
    docType === 'Privacy_Policy' ? project.privacyPolicyEn : project.termsOfServiceEn;
  const content = locale === 'en' && enContent ? enContent : baseContent;
  if (!content) {
    notFound();
  }

  const docTitle = docType === 'Privacy_Policy' ? 'Privacy Policy' : 'Terms of Service';

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Load Highlight.js atom-one-dark stylesheet from CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
      />
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight text-[var(--portal-color-text)] sm:text-4xl">
          {docTitle}
        </h1>
        <p className="mt-2 text-sm text-[var(--portal-color-text-secondary)]">
          For project: <span className="font-semibold">{project.title}</span>
        </p>
      </header>

      {/* Markdown Content */}
      <div className="prose prose-portal max-w-none">
        <SafeMDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeCustomHighlight, rehypeSlug],
            },
          }}
        />
      </div>
      <MermaidRenderer />
    </article>
  );
}
