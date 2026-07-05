'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star, Clock, Check, X, ChevronLeft, MapPin
} from 'lucide-react';
import { getExperienceDetail } from '@/lib/api';
import type { ViatorProduct, ViatorInclusionExclusion, ViatorAdditionalInfo } from '@/lib/types';
import ImageGallery from '@/components/experience/ImageGallery';
import ItinerarySection from '@/components/experience/ItinerarySection';
import ReviewsSection from '@/components/experience/ReviewsSection';
import TravellerPhotos from '@/components/experience/TravellerPhotos';
import RelatedExperiences from '@/components/experience/RelatedExperiences';
import BookingWidget from '@/components/experience/BookingWidget';

// Viator returns inclusions/exclusions as structured objects, not strings.
// Prefer the free-text override, then fall back through the type hierarchy.
function describeInclusion(item: ViatorInclusionExclusion): string {
  return (
    item.otherDescription ||
    item.typeDescription ||
    item.categoryDescription ||
    item.category ||
    ''
  );
}

function describeAdditionalInfo(item: ViatorAdditionalInfo): string {
  return item.description || item.type || '';
}

function formatDuration(p: ViatorProduct): string {
  const d = p.duration;
  if (!d) return '';
  if (d.fixedDurationInMinutes) {
    const h = Math.floor(d.fixedDurationInMinutes / 60);
    const m = d.fixedDurationInMinutes % 60;
    return h > 0 ? (m > 0 ? `${h} hours ${m} mins` : `${h} hours`) : `${m} minutes`;
  }
  if (d.variableDurationFromMinutes && d.variableDurationToMinutes) {
    return `${Math.floor(d.variableDurationFromMinutes / 60)}–${Math.floor(d.variableDurationToMinutes / 60)} hours`;
  }
  return '';
}

export default function ExperiencePage() {
  const { code } = useParams<{ code: string }>();
  const [product, setProduct] = useState<ViatorProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    // heroapi-v2's getProductDetail enriches the raw Viator content response
    // with a real, server-fetched price (via /products/search/codes) when
    // the content endpoint itself doesn't include one — see viatorClient.ts.
    getExperienceDetail(code)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded-xl" style={{ background: 'var(--nv-platinum)' }} />
        <div className="h-72 rounded-2xl" style={{ background: 'var(--nv-platinum)' }} />
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-center">
      <p className="text-lg" style={{ color: 'var(--nv-cherry-rose)' }}>{error || 'Experience not found.'}</p>
      <Link href="/search" className="nv-btn nv-btn--solid nv-btn--md mt-4 inline-flex">
        Back to search
      </Link>
    </div>
  );

  const img = product.thumbnailHiResURL || product.thumbnailURL;
  const dur = formatDuration(product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-sm mb-4 transition"
        style={{ color: 'var(--nv-steel-blue)' }}
      >
        <ChevronLeft size={15} /> Back to results
      </Link>

      {/* Photo gallery — official product images, thumbnail rail on the left (viator.com style) */}
      <ImageGallery images={product.images} fallbackUrl={img} title={product.title} />

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {product.destinationName && (
            <div className="flex items-center gap-1 mb-2" style={{ color: 'var(--nv-steel-blue)' }}>
              <MapPin size={14} />
              <span className="text-sm font-semibold">{product.destinationName}</span>
            </div>
          )}
          <h1
            className="text-2xl sm:text-3xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
          >
            {product.title}
          </h1>

          {/* Stats bar */}
          <div
            className="flex flex-wrap gap-4 p-4 rounded-2xl mb-6"
            style={{ background: 'var(--nv-surface-page)' }}
          >
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-2">
                <Star size={16} fill="var(--nv-tuscan-sun)" color="var(--nv-tuscan-sun)" />
                <span className="font-bold" style={{ color: 'var(--nv-text-heading)' }}>
                  {product.rating.toFixed(1)}
                </span>
                {product.reviewCount && (
                  <span className="text-sm" style={{ color: 'var(--nv-text-muted)' }}>
                    ({product.reviewCount.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}
            {dur && (
              <div className="flex items-center gap-2">
                <Clock size={15} style={{ color: 'var(--nv-steel-blue)' }} />
                <span className="text-sm" style={{ color: 'var(--nv-text-body)' }}>{dur}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {(product.description || product.shortDescription) && (
            <div className="mb-8">
              <h2
                className="text-lg font-bold mb-3"
                style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}
              >
                Overview
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nv-text-body)' }}>
                {product.description || product.shortDescription}
              </p>
            </div>
          )}

          {/* Itinerary — "What to expect" */}
          <ItinerarySection itinerary={product.itinerary} resolvedLocations={product.resolvedLocations} />

          {/* Inclusions / Exclusions */}
          {(product.inclusions?.length || product.exclusions?.length) ? (
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {product.inclusions?.length ? (
                <div>
                  <h2 className="font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
                    Inclusions
                  </h2>
                  <ul className="space-y-2">
                    {product.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--nv-text-body)' }}>
                        <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--nv-success)' }} />
                        {describeInclusion(inc)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {product.exclusions?.length ? (
                <div>
                  <h2 className="font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
                    Exclusions
                  </h2>
                  <ul className="space-y-2">
                    {product.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--nv-text-body)' }}>
                        <X size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--nv-cherry-rose)' }} />
                        {describeInclusion(exc)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Additional info */}
          {product.additionalInfo?.length ? (
            <div>
              <h2 className="font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
                Additional information
              </h2>
              <ul className="space-y-2">
                {product.additionalInfo.map((info, i) => (
                  <li key={i} className="text-sm" style={{ color: 'var(--nv-text-body)' }}>• {describeAdditionalInfo(info)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Reviews */}
          <ReviewsSection
            code={product.productCode}
            fallbackRating={product.rating}
            fallbackReviewCount={product.reviewCount}
          />

          {/* Traveler photos */}
          <TravellerPhotos code={product.productCode} />
        </div>

        {/* Booking panel */}
        <div className="lg:w-80 flex-shrink-0">
          <BookingWidget product={product} />
        </div>
      </div>

      {/* Other related experiences */}
      <RelatedExperiences
        code={product.productCode}
        destId={product.destinationId}
        catId={product.categories?.[0]?.id}
      />
    </div>
  );
}
