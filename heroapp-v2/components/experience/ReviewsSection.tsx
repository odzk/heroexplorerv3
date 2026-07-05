'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getExperienceReviews } from '@/lib/api';
import type { ViatorReview, ViatorReviewsSummary } from '@/lib/types';

// Fetches and renders traveler reviews. Fetched entirely client-side (never
// SSR'd) per Viator's terms — review text must not appear in indexable page
// source (docs.viator.com/partner-api/technical/#section/Key-concepts/Protecting-unique-content).
//
// The /reviews/product response shape isn't exhaustively confirmed against a
// live sandbox response, so every field below is read defensively by name —
// never spread as a raw object into JSX (the bug class fixed earlier here).

interface ReviewsSectionProps {
  code: string;
  fallbackRating?: number;
  fallbackReviewCount?: number;
}

const PER_PAGE = 10;

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

function StarRow({ rating }: { rating?: number }) {
  if (typeof rating !== 'number') return null;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < Math.round(rating) ? 'var(--nv-tuscan-sun)' : 'none'}
          color="var(--nv-tuscan-sun)"
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: ViatorReview }) {
  const dateLabel = review.publishedDate || review.travelDate;
  return (
    <div className="py-5" style={{ borderBottom: '1px solid var(--nv-border-hair)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'var(--nv-steel-blue)' }}
        >
          {initials(review.authorName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--nv-text-heading)' }}>
            {review.authorName || 'Traveler'}
          </p>
          <div className="flex items-center gap-2">
            <StarRow rating={review.rating} />
            {dateLabel && (
              <span className="text-xs" style={{ color: 'var(--nv-text-muted)' }}>{dateLabel}</span>
            )}
          </div>
        </div>
      </div>
      {review.title && (
        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--nv-text-heading)' }}>{review.title}</p>
      )}
      {review.text && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--nv-text-body)' }}>{review.text}</p>
      )}
    </div>
  );
}

function RatingBreakdown({ summary, fallbackRating, fallbackReviewCount }: {
  summary?: ViatorReviewsSummary;
  fallbackRating?: number;
  fallbackReviewCount?: number;
}) {
  const avg = summary?.combinedAverageRating ?? fallbackRating;
  const total = summary?.totalReviews ?? fallbackReviewCount;
  const totals = summary?.reviewCountTotals ?? [];
  const maxCount = Math.max(1, ...totals.map((t) => t.count ?? 0));

  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-6 p-5 rounded-2xl" style={{ background: 'var(--nv-surface-page)' }}>
      <div className="flex flex-col items-center justify-center sm:w-32 flex-shrink-0">
        <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
          {typeof avg === 'number' ? avg.toFixed(1) : '—'}
        </span>
        <StarRow rating={avg} />
        {typeof total === 'number' && (
          <span className="text-xs mt-1" style={{ color: 'var(--nv-text-muted)' }}>{total.toLocaleString()} reviews</span>
        )}
      </div>
      {totals.length > 0 && (
        <div className="flex-1 space-y-1.5 min-w-0">
          {[5, 4, 3, 2, 1].map((star) => {
            const entry = totals.find((t) => t.rating === star);
            const count = entry?.count ?? 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8 flex-shrink-0" style={{ color: 'var(--nv-text-muted)' }}>{star}★</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--nv-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--nv-tuscan-sun)' }} />
                </div>
                <span className="w-8 text-right flex-shrink-0" style={{ color: 'var(--nv-text-muted)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReviewsSection({ code, fallbackRating, fallbackReviewCount }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ViatorReview[]>([]);
  const [summary, setSummary] = useState<ViatorReviewsSummary | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = async (nextPage: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getExperienceReviews(code, nextPage, PER_PAGE);
      const batch = data.reviews ?? [];
      setReviews((prev) => (nextPage === 1 ? batch : [...prev, ...batch]));
      setSummary(data.products?.[0]);
      setHasMore(batch.length >= PER_PAGE);
      setPage(nextPage);
    } catch {
      setError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setReviews([]);
    setSummary(undefined);
    setPage(0);
    setHasMore(true);
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (error && reviews.length === 0 && page > 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
        Traveler reviews
      </h2>

      <RatingBreakdown summary={summary} fallbackRating={fallbackRating} fallbackReviewCount={fallbackReviewCount} />

      {reviews.length === 0 && !loading ? (
        <p className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>No reviews yet.</p>
      ) : (
        <div>
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      )}

      {hasMore && reviews.length > 0 && (
        <button
          type="button"
          onClick={() => loadPage(page + 1)}
          disabled={loading}
          className="nv-btn nv-btn--outlined nv-btn--md mt-4"
        >
          {loading ? 'Loading…' : 'Load more reviews'}
        </button>
      )}
    </div>
  );
}
