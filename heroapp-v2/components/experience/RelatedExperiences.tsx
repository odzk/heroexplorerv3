'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';
import { getRelatedExperiences } from '@/lib/api';
import type { ViatorProduct } from '@/lib/types';
import { experienceHref, getProductImageUrl } from '@/lib/utils';

// "Other related experiences" rail — Viator v2 has no dedicated similar-
// products endpoint, so the backend (GET /api/experiences/:code/related)
// scopes /products/search to the same destination/category and excludes the
// current product. Card styling mirrors the vertical tile used on the home
// page (components/home/FeaturedExperiences.tsx), sized for a horizontal
// scroll rail instead of a grid.

interface RelatedExperiencesProps {
  code: string;
  destId?: number;
  catId?: number;
}

function formatDuration(p: ViatorProduct): string {
  const d = p.duration;
  if (!d) return '';
  if (d.fixedDurationInMinutes) {
    const h = Math.floor(d.fixedDurationInMinutes / 60);
    const m = d.fixedDurationInMinutes % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  }
  if (d.variableDurationFromMinutes && d.variableDurationToMinutes) {
    return `${Math.floor(d.variableDurationFromMinutes / 60)}–${Math.floor(d.variableDurationToMinutes / 60)}h`;
  }
  return '';
}

function RelatedCard({ product }: { product: ViatorProduct }) {
  const img = getProductImageUrl(product, 400);
  const dur = formatDuration(product);

  return (
    <Link
      href={experienceHref(product)}
      className="nv-card flex-shrink-0 block group"
      style={{ width: 260 }}
    >
      <div className="relative h-36 overflow-hidden bg-gray-100">
        {img ? (
          <Image src={img} alt={product.title} fill sizes="260px" className="object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, var(--nv-blue-slate), var(--nv-tropical-teal))' }}>
            🌍
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
          {product.title}
        </h3>
        <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--nv-text-muted)' }}>
          {product.rating && product.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} fill="var(--nv-tuscan-sun)" color="var(--nv-tuscan-sun)" />
              <strong style={{ color: 'var(--nv-text-body)' }}>{product.rating.toFixed(1)}</strong>
            </span>
          )}
          {dur && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {dur}
            </span>
          )}
        </div>
        {product.price?.fromPrice !== undefined && (
          <div className="flex items-baseline gap-1">
            <span className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>From</span>
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-blue-slate)' }}>
              {product.price.currencyCode} {product.price.fromPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function RelatedExperiences({ code, destId, catId }: RelatedExperiencesProps) {
  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!destId) {
      setProducts([]);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    getRelatedExperiences(code, { destId, catId, limit: 8 })
      .then((data) => {
        if (!cancelled) setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code, destId, catId]);

  if (!loaded || products.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
        Other experiences you might like
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <RelatedCard key={p.productCode} product={p} />
        ))}
      </div>
    </div>
  );
}
