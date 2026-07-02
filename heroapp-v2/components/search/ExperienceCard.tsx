import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';
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
    return `${Math.floor(d.variableDurationFromMinutes / 60)}–${Math.floor(d.variableDurationToMinutes / 60)}h`;
  }
  return '';
}

export default function ExperienceCard({ product }: { product: ViatorProduct }) {
  const img = getProductImageUrl(product, 480);
  const dur = formatDuration(product);

  return (
    <Link href={`/experience/${product.productCode}`} className="nv-card group flex flex-col sm:flex-row overflow-hidden">
      {/* Thumbnail */}
      <div className="relative sm:w-52 h-44 sm:h-auto flex-shrink-0 bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, 208px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, var(--nv-blue-slate), var(--nv-tropical-teal))' }}
          >
            🌍
          </div>
        )}
        {product.flags?.includes('LIKELY_TO_SELL_OUT') && (
          <span
            className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--nv-cherry-rose)' }}
          >
            Selling fast
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          {product.destinationName && (
            <p className="text-xs mb-1" style={{ color: 'var(--nv-steel-blue)', fontFamily: 'var(--font-comfortaa)', fontWeight: 600 }}>
              {product.destinationName}
            </p>
          )}
          <h3
            className="font-bold text-base leading-snug mb-2 line-clamp-2"
            style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
          >
            {product.title}
          </h3>
          {product.shortDescription && (
            <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--nv-text-muted)' }}>
              {product.shortDescription}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--nv-text-muted)' }}>
            {product.rating && product.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} fill="var(--nv-tuscan-sun)" color="var(--nv-tuscan-sun)" />
                <strong style={{ color: 'var(--nv-text-body)' }}>{product.rating.toFixed(1)}</strong>
                {product.reviewCount ? <span>({product.reviewCount.toLocaleString()})</span> : null}
              </span>
            )}
            {dur && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {dur}
              </span>
            )}
            {product.bookingConfirmationSettings?.confirmationType === 'INSTANT' && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(74,143,110,0.1)', color: 'var(--nv-success)' }}
              >
                Instant confirmation
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        {product.price?.fromPrice !== undefined && (
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>From</span>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-blue-slate)' }}
            >
              {product.price.currencyCode} {product.price.fromPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>per person</span>
          </div>
        )}
      </div>
    </Link>
  );
}
