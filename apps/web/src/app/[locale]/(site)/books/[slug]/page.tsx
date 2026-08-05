import { getTranslations } from 'next-intl/server';
import { getTRPCServer } from '@/lib/trpc-server';
import { BookDetailClient } from './BookDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  try {
    const trpc = await getTRPCServer();
    const book = await trpc.book.get({ slug });
    if (!book) return { title: 'Not Found' };
    const tNav = await getTranslations({ locale, namespace: 'Navigation' });
    return {
      title: `${book.title} | ${tNav('books')}`,
    };
  } catch {
    return { title: 'Book Details' };
  }
}

export default function BookDetailPage() {
  return <BookDetailClient />;
}
