import { Router } from 'express';
import { asyncHandler, HttpError } from '../middleware/error';
import { viatorGet, getProductTags } from '../services/viatorClient';

// ============================================================================
// /api/categories — Viator taxonomy passthrough (legacy Category model).
// JSONP variant dropped (obsolete). Legacy `/service/*` path — verify v2.
// ============================================================================

const router = Router();

// GET /api/categories/getAllCategoriesOfADestination?destId=
router.get(
  '/getAllCategoriesOfADestination',
  asyncHandler(async (req, res) => {
    const destId = req.query.destId;
    if (!destId) throw new HttpError(400, 'destId is required');
    res.json(await viatorGet('/service/taxonomy/categories', { destId })); // LEGACY v1
  }),
);

// GET /api/categories/getProductTags  — Viator v2 tags
router.get('/getProductTags', asyncHandler(async (_req, res) => res.json(await getProductTags())));

export default router;
