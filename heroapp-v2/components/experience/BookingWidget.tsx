'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { ViatorProduct } from '@/lib/types';
import AvailabilityCalendar from './AvailabilityCalendar';
import TravelersSelector, {
  DEFAULT_AGE_BANDS,
  defaultCounts,
  totalTravelers,
} from './TravelersSelector';

interface Props {
  product: ViatorProduct;
}

export default function BookingWidget({ product }: Props) {
  const ageBands = product.pricingInfo?.ageBands?.length
    ? product.pricingInfo.ageBands
    : DEFAULT_AGE_BANDS;
  const maxTotal = product.bookingRequirements?.maxTravelersPerBooking ?? 12;

  const [date, setDate] = useState('');
  const [counts, setCounts] = useState(() => defaultCounts(ageBands));

  // INFANT is conventionally free on Viator (see the FREE tag rendered by
  // TravelersSelector) — exclude it from the price preview.
  const chargeableTravelers = ageBands
    .filter((b) => b.ageBand !== 'INFANT')
    .reduce((sum, b) => sum + (counts[b.ageBand] ?? 0), 0);
  const travelers = totalTravelers(counts);
  const previewPrice =
    product.price?.fromPrice != null
      ? product.price.fromPrice * Math.max(chargeableTravelers, 1)
      : undefined;

  const bookHref = (() => {
    const qs = new URLSearchParams();
    if (date) qs.set('date', date);
    Object.entries(counts).forEach(([band, n]) => {
      if (n && n > 0) qs.set(band.toLowerCase(), String(n));
    });
    // Price is no longer carried here — /book/[code] fetches it server-side
    // via the same getProductDetail enrichment as the detail page.
    const query = qs.toString();
    return `/book/${product.productCode}${query ? `?${query}` : ''}`;
  })();

  return (
    <div
      className="rounded-2xl p-6 sticky top-24"
      style={{
        background: 'white',
        border: '1px solid var(--nv-border-hair)',
        boxShadow: 'var(--nv-shadow-md)',
      }}
    >
      {product.price?.fromPrice !== undefined && (
        <div className="mb-4">
          <span className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>From</span>
          <div
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-blue-slate)' }}
          >
            {product.price.currencyCode}{' '}
            {(previewPrice ?? product.price.fromPrice).toLocaleString('en-AU', {
              minimumFractionDigits: 2,
            })}
          </div>
          <span className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>
            {travelers > 1 ? `for ${travelers} travellers` : 'per person'}
          </span>
        </div>
      )}

      <div className="space-y-3 mb-5">
        <AvailabilityCalendar
          code={product.productCode}
          value={date}
          onChange={setDate}
          fallbackPrice={product.price}
        />
        <TravelersSelector
          ageBands={ageBands}
          maxTotal={maxTotal}
          counts={counts}
          onChange={setCounts}
        />
      </div>

      <Link
        href={bookHref}
        className="nv-btn nv-btn--solid nv-btn--lg w-full justify-center"
        style={{ display: 'flex' }}
      >
        Book now
      </Link>

      {product.bookingConfirmationSettings?.confirmationType === 'INSTANT' && (
        <p className="text-center text-xs mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--nv-success)' }}>
          <Check size={12} /> Instant confirmation
        </p>
      )}
    </div>
  );
}
