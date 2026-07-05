import { ViatorProduct, ViatorImage, ViatorReviewPhoto, AvailabilitySchedule } from './types';

/** Pick the variant URL on a single ViatorImage closest to preferredWidth. */
export function getImageVariantUrl(
  image: ViatorImage | undefined,
  preferredWidth = 480
): string | null {
  if (!image?.variants || image.variants.length === 0) return null;
  const sorted = [...image.variants].sort(
    (a, b) => Math.abs(a.width - preferredWidth) - Math.abs(b.width - preferredWidth)
  );
  return sorted[0].url;
}

/**
 * Pick the best image URL from a Viator v2 product.
 * Prefers the cover image, then picks the variant closest to preferredWidth.
 * Falls back to v1 thumbnail fields for backward compatibility.
 */
export function getProductImageUrl(
  product: ViatorProduct,
  preferredWidth = 480
): string | null {
  const images = product.images;

  if (images && images.length > 0) {
    // Prefer cover image; fall back to first image
    const source: ViatorImage = images.find((img) => img.isCover) ?? images[0];
    const url = getImageVariantUrl(source, preferredWidth);
    if (url) return url;
  }

  // v1 fallback (sandbox may still return these)
  return product.thumbnailHiResURL ?? product.thumbnailURL ?? null;
}

/**
 * Defensively extract a usable photo URL from a review "photo" entry, which
 * Viator may represent as a plain string or as `{ url, caption }`. Never
 * return the raw object — the caller must always get back a string or null,
 * so it can never accidentally end up as a React child (the exact bug class
 * fixed earlier on this page: rendering a raw Viator object as JSX).
 */
export function asPhotoUrl(entry: ViatorReviewPhoto | string | undefined | null): string | null {
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  return typeof entry.url === 'string' ? entry.url : null;
}

// ── date helpers (booking calendar) ─────────────────────────────

/**
 * Local-timezone YYYY-MM-DD, deliberately NOT `date.toISOString()`.
 * toISOString() converts to UTC first, which shifts the date across
 * midnight for any timezone ahead of UTC — the booking date input was
 * previously using `new Date().toISOString().split('T')[0]` as its `min`,
 * which could show tomorrow's date as "today" and block same-day booking.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "2026-08-11" -> "Tue, Aug 11" (parsed as local date, not UTC). */
export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const DOW_NAMES = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

type PricingRecord = AvailabilitySchedule['bookableItems'][number]['seasons'][number]['pricingRecords'][number];

/**
 * All pricingRecords (across every bookableItem/season) that actually apply
 * to `date` — inside the season's date range, matching the day-of-week, and
 * with at least one timed entry not marked unavailable for that date.
 * Shared by isDateBookable (does any record match?) and
 * getLowestPriceForDate (what do the matching records charge?).
 */
function findPricingRecordsForDate(
  schedule: AvailabilitySchedule | null | undefined,
  date: Date,
): PricingRecord[] {
  if (!schedule?.bookableItems?.length) return [];
  const iso = toISODate(date);
  const dow = DOW_NAMES[date.getDay()];
  const matches: PricingRecord[] = [];

  for (const item of schedule.bookableItems) {
    for (const season of item.seasons ?? []) {
      if (iso < season.startDate || iso > season.endDate) continue;
      for (const rec of season.pricingRecords ?? []) {
        if (rec.daysOfWeek?.length && !rec.daysOfWeek.includes(dow)) continue;
        const entries = rec.timedEntries ?? [];
        const anySlotOpen =
          entries.length === 0 ||
          entries.some((te) => !(te.unavailableDates ?? []).some((u) => u.date === iso));
        if (anySlotOpen) matches.push(rec);
      }
    }
  }
  return matches;
}

/**
 * Whether `date` is bookable per a Viator /availability/schedules/{code}
 * response: it must fall inside a season, on a day-of-week the season's
 * pricing record operates, and not be listed as an unavailable date on
 * every timed entry for that record.
 *
 * Fails OPEN (returns true) when there's no schedule data yet, or the
 * schedule has no bookableItems at all — a missing/slow schedule fetch
 * should never silently block every date. The real availability check
 * still happens server-side via /availability/check before booking.
 */
export function isDateBookable(schedule: AvailabilitySchedule | null | undefined, date: Date): boolean {
  if (!schedule?.bookableItems?.length) return true;
  return findPricingRecordsForDate(schedule, date).length > 0;
}

/**
 * Cheapest price quoted for `date` across whichever pricingRecords apply
 * (Viator prices per season/day-of-week, not per individual date, so this
 * is usually flat within a season but can jump for peak seasons or
 * weekend-only pricing records). Returns null when there's no schedule
 * data or no matching record — callers should treat that as "don't show a
 * price", not "this date is unavailable" (use isDateBookable for that).
 */
export function getLowestPriceForDate(
  schedule: AvailabilitySchedule | null | undefined,
  date: Date,
  ageBand = 'ADULT',
): { price: number; currencyCode: string } | null {
  const records = findPricingRecordsForDate(schedule, date);
  let best: { price: number; currencyCode: string } | null = null;
  for (const rec of records) {
    const detail = rec.pricingDetails?.find((p) => p.ageBand === ageBand) ?? rec.pricingDetails?.[0];
    if (detail && (best === null || detail.price < best.price)) {
      best = { price: detail.price, currencyCode: detail.currencyCode };
    }
  }
  return best;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', AUD: '$', NZD: '$', CAD: '$', SGD: '$', HKD: '$',
  EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
};

/** Compact price for a small calendar cell — "$120" rather than "AUD 120.00". */
export function formatCompactPrice(price: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;
  return `${symbol}${Math.round(price)}`;
}

/**
 * Link to a product's detail page. Pricing used to be carried here as a
 * query-param fallback because Viator's product-detail content endpoint
 * (`/products/{code}`) doesn't include `pricing`/fromPrice — but that's now
 * fetched server-side in heroapi-v2 (getProductDetail enriches the response
 * via /products/search/codes), so the detail page always has a real,
 * Viator-sourced price without any client-supplied value in the URL.
 */
export function experienceHref(product: ViatorProduct): string {
  return `/experience/${product.productCode}`;
}
