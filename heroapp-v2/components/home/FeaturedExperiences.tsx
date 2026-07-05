'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { searchExperiences } from '@/lib/api';
import type { ViatorProduct } from '@/lib/types';
import { getProductImageUrl } from '@/lib/utils';

function formatDuration(p: ViatorProduct): string {
  const d = p.duration;
  if (!d) return '';
  if (d.fixedDurationInMinutes) {
    const h = Math.floor(d.fixedDurationInMinutes / 60);
    const m = d.fixedDurationInMinutes % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  }
  if (d.variableDurationFromMinutes && d.variableDurationToMinutes) {
    const fh = Math.floor(d.variableDurationFromMinutes / 60);
    const th = Math.floor(d.variableDurationToMinutes / 60);
    return `${fh}–${th}h`;
  }
  return '';
}

function ExperienceCard({ product }: { product: ViatorProduct }) {
  const dur = formatDuration(product);
  const img = getProductImageUrl(product, 480);

  return (
    <Link href={`/experience/${product.productCode}`} className="nv-card group block">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-3xl"
            style={{ background: 'linear-gradient(135deg, var(--nv-blue-slate), var(--nv-tropical-teal))' }}
          >
            🌍
          </div>
        )}
        {product.flags?.includes('LIKELY_TO_SELL_OUT') && (
          <span
            className="absolute top-2 left-2 text-white text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'var(--nv-cherry-rose)', fontFamily: 'var(--font-comfortaa)' }}
          >
            Selling fast
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="font-bold text-sm leading-snug mb-2 line-clamp-2"
          style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
        >
          {product.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--nv-text-muted)' }}>
          {product.rating && product.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} fill="var(--nv-tuscan-sun)" color="var(--nv-tuscan-sun)" />
              <strong style={{ color: 'var(--nv-text-body)' }}>{product.rating.toFixed(1)}</strong>
              {product.reviewCount ? (
                <span>({product.reviewCount.toLocaleString()})</span>
              ) : null}
            </span>
          )}
          {dur && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {dur}
            </span>
          )}
        </div>

        {/* Price */}
        {product.price?.fromPrice !== undefined && (
          <div className="flex items-baseline gap-1">
            <span className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>From</span>
            <span
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-blue-slate)' }}
            >
              {product.price.currencyCode}{' '}
              {product.price.fromPrice.toLocaleString('en-AU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function FeaturedExperiences() {
  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchExperiences({ sortOrder: 'TOP_RATED', perPage: 8 })
      .then(({ products }) => setProducts(products))
      .catch((err: unknown) => {
        // Surface the real cause instead of always showing a generic
        // "connect your Viator key" message — this fires the same way for
        // CORS errors, a stale NEXT_PUBLIC_API_URL, or heroapi-v2 being down.
        setError(err instanceof Error ? err.message : 'Could not reach the experiences API.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14" style={{ background: 'var(--nv-surface-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="nv-section-title">Top-Rated Experiences</h2>
          <Link
            href="/search?sortOrder=TOP_RATED"
            className="flex items-center gap-1 text-sm font-semibold transition"
            style={{ color: 'var(--nv-blue-slate)', fontFamily: 'var(--font-comfortaa)' }}
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--nv-platinum)' }}>
                <div className="h-44" />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded" style={{ background: '#d1d5db' }} />
                  <div className="h-3 w-2/3 rounded" style={{ background: '#d1d5db' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ExperienceCard key={p.productCode} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--nv-text-muted)' }}>
            <p>No experiences available right now. Connect your Viator API key to get started.</p>
          </div>
        )}
      </div>
    </section>
  );
}
