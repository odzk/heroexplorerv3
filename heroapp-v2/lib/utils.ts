import { ViatorProduct, ViatorImage } from './types';

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
    const source: ViatorImage =
      images.find((img) => img.isCover) ?? images[0];

    if (source.variants && source.variants.length > 0) {
      // Pick variant closest to preferredWidth
      const sorted = [...source.variants].sort(
        (a, b) =>
          Math.abs(a.width - preferredWidth) -
          Math.abs(b.width - preferredWidth)
      );
      return sorted[0].url;
    }
  }

  // v1 fallback (sandbox may still return these)
  return product.thumbnailHiResURL ?? product.thumbnailURL ?? null;
}
