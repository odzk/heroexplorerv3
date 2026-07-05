'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExperienceAvailability } from '@/lib/api';
import type { AvailabilitySchedule } from '@/lib/types';
import { formatCompactPrice, formatDateLabel, getLowestPriceForDate, isDateBookable, toISODate } from '@/lib/utils';

interface Props {
  code: string;
  /** Selected date as YYYY-MM-DD, or '' if none chosen yet. */
  value: string;
  onChange: (date: string) => void;
  /** 'dropdown' (product page preview) or 'inline' (booking page, always expanded). */
  variant?: 'dropdown' | 'inline';
  /**
   * The product's general "from" price (product.price), shown under a
   * bookable date whenever Viator's per-date schedule has no pricingDetails
   * match for that date — so the calendar always shows *a* price instead of
   * silently rendering blank cells.
   */
  fallbackPrice?: { fromPrice: number; currencyCode: string };
}

export default function AvailabilityCalendar({ code, value, onChange, variant = 'dropdown', fallbackPrice }: Props) {
  const [open, setOpen] = useState(variant === 'inline');
  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? parseISO(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const wrapRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Fetch the full schedule once, the first time the calendar is opened.
  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    getExperienceAvailability(code)
      .then(setSchedule)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }, [open, code]);

  useEffect(() => {
    if (variant === 'inline') return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [variant]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  // Resolve bookability + price once per visible cell — every bookable date
  // with pricing data in the schedule gets its price shown underneath it.
  const cellData = cells.map((d) => {
    if (!d) return null;
    const isPast = d < today;
    const bookable = isPast ? false : loadFailed ? true : isDateBookable(schedule, d);
    const price =
      !isPast && bookable
        ? getLowestPriceForDate(schedule, d) ??
          (fallbackPrice ? { price: fallbackPrice.fromPrice, currencyCode: fallbackPrice.currencyCode } : null)
        : null;
    return { date: d, isPast, bookable, price };
  });

  function selectDate(d: Date) {
    onChange(toISODate(d));
    if (variant === 'dropdown') setOpen(false);
  }

  const panel = (
    <div
      className={variant === 'dropdown' ? 'absolute z-50 mt-2 left-0 w-72 rounded-2xl bg-white p-4' : ''}
      style={
        variant === 'dropdown'
          ? { border: '1px solid var(--nv-border-hair)', boxShadow: 'var(--nv-shadow-md)' }
          : undefined
      }
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="p-1 rounded-full transition hover:bg-black/5"
        >
          <ChevronLeft size={16} style={{ color: 'var(--nv-steel-blue)' }} />
        </button>
        <span
          className="text-sm font-semibold"
          style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
        >
          {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="p-1 rounded-full transition hover:bg-black/5"
        >
          <ChevronRight size={16} style={{ color: 'var(--nv-steel-blue)' }} />
        </button>
      </div>
      <div
        className="grid grid-cols-7 gap-1 text-center text-[11px] mb-1"
        style={{ color: 'var(--nv-text-muted)' }}
      >
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cellData.map((c, i) => {
          if (!c) return <div key={i} />;
          const { date: d, isPast, bookable, price } = c;
          const iso = toISODate(d);
          const disabled = isPast || !bookable;
          const selected = iso === value;
          const priceLabel = price ? formatCompactPrice(price.price, price.currencyCode) : null;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => selectDate(d)}
              className={`flex flex-col items-center justify-center text-sm transition ${
                priceLabel ? 'w-10 h-12 rounded-lg gap-0.5' : 'w-9 h-9 rounded-full'
              }`}
              style={{
                background: selected ? 'var(--nv-blue-slate)' : 'transparent',
                color: selected ? 'white' : disabled ? 'var(--nv-border)' : 'var(--nv-text-body)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textDecoration: disabled && !isPast ? 'line-through' : undefined,
              }}
            >
              <span>{d.getDate()}</span>
              {priceLabel && (
                <span
                  className="text-[9px] font-bold leading-none"
                  style={{ color: selected ? 'white' : 'var(--nv-cherry-rose)' }}
                >
                  {priceLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {loading && (
        <p className="text-xs mt-3" style={{ color: 'var(--nv-text-muted)' }}>Checking availability…</p>
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
        <CalendarIcon size={16} style={{ color: 'var(--nv-steel-blue)' }} />
        <div className="flex-1">
          <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>Select date</p>
          <p className="text-sm font-medium" style={{ color: 'var(--nv-text-body)' }}>
            {value ? formatDateLabel(value) : 'Choose a date'}
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

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : new Date();
}
