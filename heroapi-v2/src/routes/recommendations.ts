import { Router } from 'express';
import { asyncHandler, HttpError } from '../middleware/error';
import { viatorGet, viatorPost } from '../services/viatorClient';

// ============================================================================
// /api/recommendations — ported from legacy Recommendation model.
// Fixes vs legacy: getAllPhotos path collided with getAllReviews; malformed
// query strings. All `/service/*` are LEGACY v1 paths — verify against Viator v2.
// ============================================================================

const router = Router();

router.post('/listTopRecommendationOfADestination', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/search/recommendation', req.body)))); // LEGACY v1

router.get('/getAllRecommendationsFromSeoIdAndCurrencyCode', asyncHandler(async (req, res) => {
  const { seoId, currencyCode } = req.query;
  if (!seoId) throw new HttpError(400, 'seoId is required');
  res.json(await viatorGet('/service/recommendation', { seoId, currencyCode })); // LEGACY v1
}));
router.get('/getAllProductsRelatedToRecommendation', asyncHandler(async (req, res) => {
  const { seoId, currencyCode, topX, sortOrder } = req.query;
  res.json(await viatorGet('/service/recommendation/products', { seoId, currencyCode, topX, sortOrder })); // LEGACY v1
}));
router.get('/getAllReviewsRelatedToRecommendation', asyncHandler(async (req, res) => {
  const { seoId, topX, sortOrder } = req.query;
  res.json(await viatorGet('/service/recommendation/reviews', { seoId, topX, sortOrder })); // LEGACY v1
}));
// FIXED: legacy registered this under the reviews path (collision).
router.get('/getAllPhotosRelatedToRecommendation', asyncHandler(async (req, res) => {
  const { seoId, topX } = req.query;
  res.json(await viatorGet('/service/recommendation/photos', { seoId, topX })); // LEGACY v1
}));
router.get('/getAllPanoramasRelatedToRecommendation', asyncHandler(async (req, res) => {
  const { seoId, topX } = req.query;
  res.json(await viatorGet('/service/recommendation/panoramas', { seoId, topX })); // LEGACY v1
}));

export default router;
