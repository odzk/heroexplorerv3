import { Router } from 'express';
import { asyncHandler, HttpError } from '../middleware/error';
import { viatorGet, viatorPost } from '../services/viatorClient';

// ============================================================================
// /api/attractions — ported from legacy Attraction model.
// Fixes vs legacy: the getAllPhotos path collided with getAllReviews, and
// several query strings were malformed ("&topX" without "="). Using a params
// object fixes encoding automatically. All `/service/*` + `/v1/*` are LEGACY v1
// paths — verify against Viator v2 (tracked in MIGRATION.md).
// ============================================================================

const router = Router();

router.post('/listAttractionOfADestination', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/taxonomy/attractions', req.body)))); // LEGACY v1
router.post('/listTopAttractionOfADestination', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/v1/taxonomy/attractions', req.body)))); // LEGACY v1
router.post('/postAllAttractionsFromDestIdAndTopXV2', asyncHandler(async (req, res) => {
  const { destId, topX, sortOrder } = req.body ?? {};
  res.json(await viatorPost('/v1/taxonomy/attractions', { destId, topX, sortOrder }));
}));

router.get('/getAllAttractionsFromSeoIdAndCurrencyCode', asyncHandler(async (req, res) => {
  const { seoId, currencyCode } = req.query;
  if (!seoId) throw new HttpError(400, 'seoId is required');
  res.json(await viatorGet('/service/attraction', { seoId, currencyCode })); // LEGACY v1
}));
router.get('/getAllProductsRelatedToAttraction', asyncHandler(async (req, res) => {
  const { seoId, currencyCode, topX, sortOrder } = req.query;
  res.json(await viatorGet('/service/attraction/products', { seoId, currencyCode, topX, sortOrder })); // LEGACY v1
}));
router.get('/getAllReviewsRelatedToAttraction', asyncHandler(async (req, res) => {
  const { seoId, topX, sortOrder } = req.query;
  res.json(await viatorGet('/service/attraction/reviews', { seoId, topX, sortOrder })); // LEGACY v1
}));
// FIXED: legacy registered this under the reviews path (collision).
router.get('/getAllPhotosRelatedToAttraction', asyncHandler(async (req, res) => {
  const { seoId, topX } = req.query;
  res.json(await viatorGet('/service/attraction/photos', { seoId, topX })); // LEGACY v1
}));
router.get('/getAllPanoramasRelatedToAttraction', asyncHandler(async (req, res) => {
  const { seoId, topX } = req.query;
  res.json(await viatorGet('/service/attraction/panoramas', { seoId, topX })); // LEGACY v1
}));

// Static curated top attractions (legacy returned a hardcoded list).
const TOP_ATTRACTIONS = [
  { title: 'Alcatraz', seoId: 'alcatraz' },
  { title: 'Colosseum', seoId: 'colosseum' },
  { title: 'Eiffel Tower', seoId: 'eiffel-tower' },
  { title: 'Sydney Opera House', seoId: 'sydney-opera-house' },
  { title: 'Statue of Liberty', seoId: 'statue-of-liberty' },
];
router.get('/getTopAttractions', asyncHandler(async (_req, res) => res.json(TOP_ATTRACTIONS)));

export default router;
