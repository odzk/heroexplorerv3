import { ViatorProduct, ViatorImage, ViatorReviewPhoto } from './types';

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
