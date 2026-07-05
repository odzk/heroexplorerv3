'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, ChevronDown, Minus, Plus } from 'lucide-react';
import type { AgeBandCode, ViatorAgeBand } from '@/lib/types';

export type TravelerCounts = Partial<Record<AgeBandCode, number>>;

// Used whenever a product has no pricingInfo.ageBands at all — keeps the
// previous "1 adult, no children/infants" behaviour working everywhere.
export const DEFAULT_AGE_BANDS: ViatorAgeBand[] = [
  { ageBand: 'ADULT', minTravelersPerBooking: 1, maxTravelersPerBooking: 12 },
];

const BAND_META: Record<AgeBandCode, { label: string; fallbackAge: string; free?: boolean }> = {
  ADULT: { label: 'Adult', fallbackAge: '13-100' },
  CHILD: { label: 'Child', fallbackAge: '3-12' },
  INFANT: { label: 'Infant', fallbackAge: '0-2', free: true },
  YOUTH: { label: 'Youth', fallbackAge: '13-17' },
  SENIOR: { label: 'Senior', fallbackAge: '65+' },
  TRAVELER: { label: 'Traveler', fallbackAge: '' },
};

function ageLabel(band: ViatorAgeBand): string {
  const meta = BAND_META[band.ageBand];
  if (band.startAge != null && band.endAge != null) return `Age ${band.startAge}-${band.endAge}`;
  return meta?.fallbackAge ? `Age ${meta.fallbackAge}` : '';
}

/** Seed counts from each band's own minimum (ADULT defaults to 1 if unspecified). */
export function defaultCounts(bands: ViatorAgeBand[]): TravelerCounts {
  const counts: TravelerCounts = {};
  bands.forEach((b) => {
    const min = b.minTravelersPerBooking ?? 0;
    counts[b.ageBand] = min > 0 ? min : b.ageBand === 'ADULT' ? 1 : 0;
  });
  return counts;
}

export function totalTravelers(counts: TravelerCounts): number {
  return Object.values(counts).reduce((sum: number, n) => sum + (n ?? 0), 0);
}

export function summarizeCounts(counts: TravelerCounts): string {
  const parts = Object.entries(counts)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([band, n]) => {
      const label = (BAND_META[band as AgeBandCode]?.label ?? band).toLowerCase();
      return `${n} ${label}${(n ?? 0) > 1 ? 's' : ''}`;
    });
  return parts.length ? parts.join(', ') : 'Add travellers';
}

interface Props {
  ageBands?: ViatorAgeBand[];
  /** Overall cap across all bands combined — Viator's "Select up to N travelers in total". */
  maxTotal?: number;
  counts: TravelerCounts;
  onChange: (next: TravelerCounts) => void;
  /** 'dropdown' (product page preview) or 'inline' (booking page, always expanded). */
  variant?: 'dropdown' | 'inline';
}

export default function TravelersSelector({
  ageBands,
  maxTotal = 12,
  counts,
  onChange,
  variant = 'dropdown',
}: Props) {
  const bands = ageBands && ageBands.length > 0 ? ageBands : DEFAULT_AGE_BANDS;
  const [open, setOpen] = useState(variant === 'inline');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === 'inline') return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [variant]);

  const total = totalTravelers(counts);

  function step(band: ViatorAgeBand, delta: number) {
    const min = band.minTravelersPerBooking ?? 0;
    const max = band.maxTravelersPerBooking ?? maxTotal;
    const current = counts[band.ageBand] ?? 0;
    const next = current + delta;
    if (next < min || next > max) return;
    if (delta > 0 && total >= maxTotal) return;
    onChange({ ...counts, [band.ageBand]: next });
  }

  const panel = (
    <div
      className={variant === 'dropdown' ? 'absolute z-50 mt-2 left-0 w-80 rounded-2xl bg-white p-5' : ''}
      style={
        variant === 'dropdown'
          ? { border: '1px solid var(--nv-border-hair)', boxShadow: 'var(--nv-shadow-md)' }
          : undefined
      }
    >
      <p className="text-xs mb-4" style={{ color: 'var(--nv-text-muted)' }}>
        Select up to {maxTotal} travellers in total.
      </p>
      <div className="space-y-4">
        {bands.map((band) => {
          const meta = BAND_META[band.ageBand] ?? { label: band.ageBand, fallbackAge: '' };
          const count = counts[band.ageBand] ?? 0;
          const min = band.minTravelersPerBooking ?? 0;
          const max = band.maxTravelersPerBooking ?? maxTotal;
          const age = ageLabel(band);
          return (
            <div key={band.ageBand} className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--nv-text-heading)' }}>
                    {meta.label}
                  </span>
                  {meta.free && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(74,143,110,0.12)', color: 'var(--nv-success)' }}
                    >
                      FREE
                    </span>
                  )}
                </div>
                {age && <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>{age}</p>}
                <p className="text-[11px]" style={{ color: 'var(--nv-text-muted)' }}>
                  Minimum: {min}, Maximum: {max}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => step(band, -1)}
                  disabled={count <= min}
                  aria-label={`Decrease ${meta.label}`}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition"
                  style={{
                    borderColor: 'var(--nv-success)',
                    color: 'var(--nv-success)',
                    opacity: count <= min ? 0.35 : 1,
                    cursor: count <= min ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center font-semibold" style={{ color: 'var(--nv-text-body)' }}>
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => step(band, 1)}
                  disabled={count >= max || total >= maxTotal}
                  aria-label={`Increase ${meta.label}`}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition"
                  style={{
                    borderColor: 'var(--nv-success)',
                    color: 'var(--nv-success)',
                    opacity: count >= max || total >= maxTotal ? 0.35 : 1,
                    cursor: count >= max || total >= maxTotal ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {variant === 'dropdown' && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="nv-btn nv-btn--lg w-full justify-center mt-5"
          style={{ display: 'flex', background: 'var(--nv-success)', color: 'white' }}
        >
          Apply
        </button>
      )}
    </div>
  );

  if (variant === 'inline') return panel;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition"
        style={{ background: 'var(--nv-surface-page)' }}
      >
        <Users size={16} style={{ color: 'var(--nv-steel-blue)' }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>Travellers</p>
          <p className="text-sm font-medium truncate" style={{ color: 'var(--nv-text-body)' }}>
            {summarizeCounts(counts)}
          </p>
        </div>
        <ChevronDown
          size={14}
          style={{ color: 'var(--nv-text-muted)', transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>
      {open && panel}
    </div>
  );
}
