'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExperienceReviews } from '@/lib/api';
import { asPhotoUrl } from '@/lib/utils';

// Traveler photos are sourced from review `photos` entries — Viator has no
// dedicated "traveler photos" v2 endpoint, so this derives them from a
// larger reviews page. `asPhotoUrl` defensively normalizes each entry
// (string or `{ url }`) to a plain string; anything else is dropped rather
// than risk rendering a raw object as a React child.

interface TravellerPhotosProps {
  code: string;
}

const PHOTOS_REVIEW_PAGE_SIZE = 30;

export default function TravellerPhotos({ code }: TravellerPhotosProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPhotos([]);
    setLoaded(false);

    getExperienceReviews(code, 1, PHOTOS_REVIEW_PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        const urls = (data.reviews ?? [])
          .flatMap((r) => r.photos ?? [])
          .map(asPhotoUrl)
          .filter((u): u is string => !!u);
        setPhotos(urls);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % photos.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, photos.length]);

  if (!loaded || photos.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
        Traveler photos
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: 140, height: 140 }}
          >
            <Image src={url} alt={`Traveler photo ${i + 1}`} fill className="object-cover" sizes="140px" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,14,14,0.92)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Traveler photos"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))}
              className="absolute left-2 sm:left-6 text-white/80 hover:text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft size={36} />
            </button>
          )}
          <div className="relative w-[92vw] h-[70vh] max-w-4xl">
            <Image src={photos[lightboxIndex]} alt={`Traveler photo ${lightboxIndex + 1}`} fill className="object-contain" sizes="92vw" />
          </div>
          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex((i) => (i === null ? i : (i + 1) % photos.length))}
              className="absolute right-2 sm:right-6 text-white/80 hover:text-white"
              aria-label="Next photo"
            >
              <ChevronRight size={36} />
            </button>
          )}
          <span className="absolute bottom-6 right-6 text-white/70 text-xs">
            {lightboxIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}
