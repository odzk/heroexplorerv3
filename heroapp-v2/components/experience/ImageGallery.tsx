'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import type { ViatorImage } from '@/lib/types';
import { getImageVariantUrl } from '@/lib/utils';

// Viator.com-style product gallery: a vertical thumbnail rail on the left
// (horizontal strip on mobile) with a large preview on the right, plus a
// full-screen lightbox with prev/next + keyboard navigation.

interface ImageGalleryProps {
  images?: ViatorImage[];
  fallbackUrl?: string | null;
  title: string;
}

export default function ImageGallery({ images, fallbackUrl, title }: ImageGalleryProps) {
  const gallery: ViatorImage[] =
    images && images.length > 0
      ? images
      : fallbackUrl
        ? [{ variants: [{ width: 1200, height: 800, url: fallbackUrl }] }]
        : [];

  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeActive = Math.min(active, Math.max(gallery.length - 1, 0));

  const goTo = useCallback(
    (i: number) => {
      if (gallery.length === 0) return;
      setActive(((i % gallery.length) + gallery.length) % gallery.length);
    },
    [gallery.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goTo(safeActive - 1);
      if (e.key === 'ArrowRight') goTo(safeActive + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, safeActive, goTo]);

  if (gallery.length === 0) {
    return (
      <div
        className="h-72 sm:h-96 rounded-2xl mb-8 flex items-center justify-center"
        style={{ background: 'var(--nv-platinum)' }}
      >
        <Camera size={40} style={{ color: 'var(--nv-text-muted)' }} />
      </div>
    );
  }

  const mainUrl = getImageVariantUrl(gallery[safeActive], 1200) ?? fallbackUrl ?? '';

  return (
    <div className="mb-8">
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* Thumbnail rail — vertical on desktop, horizontal on mobile */}
        {gallery.length > 1 && (
          <div
            className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:h-96 sm:w-32 order-2 sm:order-1 pb-1 sm:pb-0"
            role="listbox"
            aria-label="Product photos"
          >
            {gallery.map((img, i) => {
              const thumb = getImageVariantUrl(img, 200);
              const isActive = i === safeActive;
              return (
                <button
                  key={i}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => goTo(i)}
                  className="relative flex-shrink-0 rounded-lg overflow-hidden w-full"
                  style={{
                    width: 116,
                    height: 84,
                    outline: isActive ? '2px solid var(--nv-blue-slate)' : '2px solid transparent',
                    outlineOffset: '-2px',
                    opacity: isActive ? 1 : 0.75,
                    transition: 'opacity 150ms ease, outline-color 150ms ease',
                  }}
                >
                  {thumb ? (
                    <Image src={thumb} alt={img.caption || `${title} photo ${i + 1}`} fill className="object-cover" sizes="72px" />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'var(--nv-platinum)' }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main preview */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative h-72 sm:h-96 flex-1 rounded-2xl overflow-hidden bg-gray-100 order-1 sm:order-2 cursor-zoom-in"
          aria-label="Open full-screen gallery"
        >
          {mainUrl && (
            <Image src={mainUrl} alt={gallery[safeActive]?.caption || title} fill className="object-cover" priority sizes="(max-width: 640px) 100vw, 900px" />
          )}
          {gallery.length > 1 && (
            <span
              className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white flex items-center gap-1"
              style={{ background: 'rgba(20,30,30,0.55)' }}
            >
              <Camera size={12} /> {safeActive + 1} / {gallery.length}
            </span>
          )}
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,14,14,0.92)' }}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo gallery`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close gallery"
          >
            <X size={28} />
          </button>

          {gallery.length > 1 && (
            <button
              type="button"
              onClick={() => goTo(safeActive - 1)}
              className="absolute left-2 sm:left-6 text-white/80 hover:text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          <div className="relative w-[92vw] h-[70vh] max-w-5xl">
            {mainUrl && (
              <Image src={mainUrl} alt={gallery[safeActive]?.caption || title} fill className="object-contain" sizes="92vw" />
            )}
          </div>

          {gallery.length > 1 && (
            <button
              type="button"
              onClick={() => goTo(safeActive + 1)}
              className="absolute right-2 sm:right-6 text-white/80 hover:text-white"
              aria-label="Next photo"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {gallery[safeActive]?.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/85 text-sm text-center px-6 max-w-xl">
              {gallery[safeActive].caption}
            </p>
          )}

          <span className="absolute bottom-6 right-6 text-white/70 text-xs">
            {safeActive + 1} / {gallery.length}
          </span>
        </div>
      )}
    </div>
  );
}
