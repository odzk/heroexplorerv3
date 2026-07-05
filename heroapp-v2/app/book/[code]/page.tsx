'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, Calendar, Users, CreditCard, Check, AlertCircle } from 'lucide-react';
import {
  getExperienceDetail,
  checkProductAvailability,
  holdBooking,
  bookExperience,
} from '@/lib/api';
import type { AgeBandCode, BookRequestPayload, BookingResult, PaxMixEntry, ViatorProduct } from '@/lib/types';
import { formatDateLabel } from '@/lib/utils';
import AvailabilityCalendar from '@/components/experience/AvailabilityCalendar';
import TravelersSelector, {
  DEFAULT_AGE_BANDS,
  defaultCounts,
  summarizeCounts,
  totalTravelers,
  type TravelerCounts,
} from '@/components/experience/TravelersSelector';

// Every ageBand key TravelerCounts / query params might use, lowercased for
// the ?adult=2&child=1 query string BookingWidget builds on the product page.
const BAND_CODES: AgeBandCode[] = ['ADULT', 'CHILD', 'INFANT', 'YOUTH', 'SENIOR', 'TRAVELER'];

function countsFromSearchParams(params: URLSearchParams): TravelerCounts {
  const counts: TravelerCounts = {};
  BAND_CODES.forEach((band) => {
    const raw = params.get(band.toLowerCase());
    const n = raw != null ? parseInt(raw, 10) : NaN;
    if (!Number.isNaN(n) && n > 0) counts[band] = n;
  });
  return counts;
}

export default function BookPage() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<ViatorProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'details' | 'confirm' | 'done'>('details');
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionCode, setSelectedOptionCode] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [form, setForm] = useState({
    date: searchParams.get('date') ?? '',
    counts: countsFromSearchParams(searchParams),
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (!code) return;
    getExperienceDetail(code)
      .then((data) => {
        setProduct(data);
        // Seed any traveler bands the query string didn't cover (e.g. the
        // user landed here directly) using the product's own defaults —
        // but never clobber counts that already came from the query string.
        const bands = data.pricingInfo?.ageBands?.length ? data.pricingInfo.ageBands : DEFAULT_AGE_BANDS;
        setForm((f) => {
          if (Object.keys(f.counts).length > 0) return f;
          return { ...f, counts: defaultCounts(bands) };
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const ageBands = product?.pricingInfo?.ageBands?.length ? product.pricingInfo.ageBands : DEFAULT_AGE_BANDS;
  const maxTotal = product?.bookingRequirements?.maxTravelersPerBooking ?? 12;

  // INFANT is free on Viator (see the FREE tag in TravelersSelector) — never charged.
  const chargeableTravelers = ageBands
    .filter((b) => b.ageBand !== 'INFANT')
    .reduce((sum, b) => sum + (form.counts[b.ageBand] ?? 0), 0);
  const travelers = totalTravelers(form.counts);

  function buildPaxMix(): PaxMixEntry[] {
    return Object.entries(form.counts)
      .filter(([, n]) => (n ?? 0) > 0)
      .map(([ageBand, numberOfTravelers]) => ({
        ageBand: ageBand as AgeBandCode,
        numberOfTravelers: numberOfTravelers as number,
      }));
  }

  // Step 1 -> 2: confirm real availability on heroapi-v2 before showing the
  // confirm screen (POST /api/products/loadOptionsOfAProduct).
  async function handleContinue() {
    if (!product || !form.date || travelers === 0) return;
    setChecking(true);
    setError(null);
    try {
      const currency = product.price?.currencyCode || 'AUD';
      const result = await checkProductAvailability({
        productCode: code,
        travelDate: form.date,
        currency,
        paxMix: buildPaxMix(),
      });
      const item = result.bookableItems?.[0];
      if (!item) {
        setError('No availability found for the selected date. Please choose another date.');
        return;
      }
      setSelectedOptionCode(item.productOptionCode ?? null);
      setStep('confirm');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not check availability. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  // Step 2 -> done: hold (best-effort) then book for real
  // (POST /api/products/bookAProductHold, POST /api/products/bookAProduct).
  async function handleConfirm() {
    if (!product) return;
    setSubmitting(true);
    setError(null);
    const currency = product.price?.currencyCode || 'AUD';
    const payload: BookRequestPayload = {
      productCode: code,
      productOptionCode: selectedOptionCode ?? undefined,
      travelDate: form.date,
      currency,
      paxMix: buildPaxMix(),
      communication: { email: form.email, firstName: form.firstName, lastName: form.lastName },
      bookingQuestionAnswers: [],
      partnerBookingRef: `HE-${code}-${Date.now()}`,
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      productTitle: product.title,
      chargedPrice: total,
    };

    try {
      // Best-effort hold — some sandbox configs don't require a separate hold
      // step before book; a hold failure alone should not block the booking.
      await holdBooking(payload).catch(() => undefined);

      const result = await bookExperience(payload);
      if (result.status && result.status !== 'CONFIRMED') {
        setError(result.message || `Booking could not be confirmed (status: ${result.status}).`);
        return;
      }
      setBookingResult(result);
      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded" style={{ background: 'var(--nv-platinum)' }} />
        <div className="h-64 rounded-2xl" style={{ background: 'var(--nv-platinum)' }} />
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p style={{ color: 'var(--nv-cherry-rose)' }}>Experience not found.</p>
      <Link href="/search" className="nv-btn nv-btn--solid nv-btn--md mt-4 inline-flex">Back to search</Link>
    </div>
  );

  const total = (product.price?.fromPrice || 0) * chargeableTravelers;

  if (step === 'done') return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(74,143,110,0.12)' }}
      >
        <Check size={32} style={{ color: 'var(--nv-success)' }} />
      </div>
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
      >
        Booking confirmed!
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--nv-text-muted)' }}>
        A confirmation email has been sent to {form.email}.
      </p>
      <div className="mb-8">
        <p
          className="font-semibold mb-1"
          style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-body)' }}
        >
          {product.title}
        </p>
        {bookingResult?.itineraryId && (
          <p className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>
            Booking reference: {bookingResult.itineraryId}
          </p>
        )}
      </div>
      <Link href="/" className="nv-btn nv-btn--solid nv-btn--md inline-flex">
        Back to home
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/experience/${code}`}
        className="inline-flex items-center gap-1 text-sm mb-6 transition"
        style={{ color: 'var(--nv-steel-blue)' }}
      >
        <ChevronLeft size={15} /> Back to experience
      </Link>

      <h1
        className="text-xl font-bold mb-1"
        style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
      >
        {step === 'details' ? 'Select date & travellers' : 'Confirm your booking'}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--nv-text-muted)' }}>{product.title}</p>

      {error && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl mb-6 text-sm"
          style={{ background: 'rgba(152,38,73,0.08)', color: 'var(--nv-cherry-rose)' }}
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['details', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: step === s || (s === 'details' && step === 'confirm') ? 'var(--nv-blue-slate)' : 'var(--nv-platinum)',
                color: step === s || (s === 'details' && step === 'confirm') ? 'white' : 'var(--nv-text-muted)',
              }}
            >
              {i + 1}
            </div>
            <span className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>
              {s === 'details' ? 'Select' : 'Confirm'}
            </span>
            {i < 1 && <div className="w-8 h-px" style={{ background: 'var(--nv-border)' }} />}
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'white', border: '1px solid var(--nv-border-hair)', boxShadow: 'var(--nv-shadow-sm)' }}
      >
        {step === 'details' ? (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: 'var(--nv-text-muted)' }}>
                <Calendar size={13} /> Date
              </label>
              <div className="p-3 rounded-xl" style={{ background: 'var(--nv-surface-page)' }}>
                <AvailabilityCalendar
                  code={code}
                  value={form.date}
                  onChange={(date) => setForm({ ...form, date })}
                  variant="inline"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: 'var(--nv-text-muted)' }}>
                <Users size={13} /> Travellers
              </label>
              <div className="p-4 rounded-xl" style={{ background: 'var(--nv-surface-page)' }}>
                <TravelersSelector
                  ageBands={ageBands}
                  maxTotal={maxTotal}
                  counts={form.counts}
                  onChange={(counts) => setForm({ ...form, counts })}
                  variant="inline"
                />
              </div>
            </div>

            {/* Price summary */}
            {product.price?.fromPrice && (
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--nv-surface-page)' }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--nv-text-muted)' }}>
                    {product.price.currencyCode} {product.price.fromPrice.toFixed(2)} × {chargeableTravelers} traveller{chargeableTravelers !== 1 ? 's' : ''}
                  </span>
                  <span style={{ color: 'var(--nv-text-body)' }}>
                    {product.price.currencyCode} {total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-blue-slate)' }}>
                    {product.price.currencyCode} {total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!form.date || travelers === 0 || checking}
              className="nv-btn nv-btn--solid nv-btn--lg w-full justify-center"
              style={{ display: 'flex', opacity: !form.date || travelers === 0 || checking ? 0.5 : 1 }}
            >
              {checking ? 'Checking availability...' : 'Continue'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>First name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="nv-input"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>Last name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="nv-input"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--nv-text-muted)' }}>Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="nv-input"
                placeholder="you@example.com"
              />
            </div>

            {/* Booking summary */}
            <div className="p-4 rounded-xl text-sm space-y-2" style={{ background: 'var(--nv-surface-page)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--nv-text-muted)' }}>Date</span>
                <span style={{ color: 'var(--nv-text-body)' }}>{form.date ? formatDateLabel(form.date) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--nv-text-muted)' }}>Travellers</span>
                <span className="capitalize" style={{ color: 'var(--nv-text-body)' }}>{summarizeCounts(form.counts)}</span>
              </div>
              {product.price && (
                <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--nv-border-hair)' }}>
                  <span style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-blue-slate)' }}>
                    {product.price.currencyCode} {total.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'rgba(107,161,191,0.08)', color: 'var(--nv-steel-blue)' }}>
              <CreditCard size={14} /> Payment processing handled securely by Viator
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="nv-btn nv-btn--outlined nv-btn--md flex-1 justify-center"
                style={{ display: 'flex' }}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!form.firstName || !form.email || submitting}
                className="nv-btn nv-btn--solid nv-btn--md flex-2 justify-center"
                style={{ display: 'flex', flex: 2, opacity: (!form.firstName || !form.email || submitting) ? 0.5 : 1 }}
              >
                {submitting ? 'Booking...' : 'Confirm booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
