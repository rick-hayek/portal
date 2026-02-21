'use client';

import { useState } from 'react';
import { trpc } from '@/lib/api/client';
import PhotoAlbum, { type RenderImageProps, type RenderImageContext, type RenderWrapperProps, type RenderWrapperContext } from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function GalleryPage() {
    const t = useTranslations('Gallery');

    function renderNextImage(
        { alt = "", title, sizes, className, onClick, style }: RenderImageProps,
        { photo, width, height }: RenderImageContext
    ) {
        return (
            <Image
                src={photo.src}
                alt={alt || "Gallery image"}
                title={title}
                sizes={sizes}
                width={width}
                height={height}
                className={`${className} object-cover transition-transform duration-500 group-hover:scale-105`}
                style={{ ...style, width: '100%', height: 'auto' }}
                onClick={onClick}
            />
        );
    }

    function renderWrapper(
        { style, ...rest }: RenderWrapperProps,
        context: RenderWrapperContext
    ) {
        return (
            <div
                {...rest}
                style={{ ...style, position: 'relative' }}
                className="group overflow-hidden rounded-xl bg-[var(--portal-color-surface)] shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
                {rest.children}
                {/* Elegant overlay on hover */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </div>
        );
    }

    const { data: mediaItems, isLoading } = trpc.gallery.list.useQuery();
    const [index, setIndex] = useState(-1);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 space-y-4 text-center">
                    <h1 className="text-4xl font-black text-[var(--portal-color-text)] tracking-tight">{t('title')}</h1>
                    <p className="text-[var(--portal-color-text-secondary)]">{t('loading')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square animate-pulse rounded-xl bg-[var(--portal-color-surface)]" />
                    ))}
                </div>
            </div>
        );
    }

    if (!mediaItems || mediaItems.length === 0) {
        return (
            <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-black text-[var(--portal-color-text)] tracking-tight">{t('title')}</h1>
                <p className="mt-8 text-[var(--portal-color-text-secondary)]">{t('noPhotos')}</p>
            </div>
        );
    }

    const photos = mediaItems.map((item) => ({
        src: item.url,
        width: item.width ?? 800,
        height: item.height ?? 600,
        alt: item.alt || item.filename,
    }));

    return (
        <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-[var(--portal-color-text)] tracking-tight">{t('title')}</h1>
                <p className="mt-4 text-lg text-[var(--portal-color-text-secondary)]">{t('description')}</p>
            </div>

            <PhotoAlbum
                layout="masonry"
                photos={photos}
                spacing={16}
                padding={0}
                columns={(containerWidth) => {
                    if (containerWidth < 640) return 2;
                    if (containerWidth < 1024) return 3;
                    return 4;
                }}
                onClick={({ index: current }) => setIndex(current)}
                render={{ image: renderNextImage, wrapper: renderWrapper }}
            />

            <Lightbox
                index={index}
                open={index >= 0}
                close={() => setIndex(-1)}
                slides={photos}
                styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .9)' } }}
            />
        </div>
    );
}
