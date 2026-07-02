import { Router } from 'express';
import { asyncHandler, HttpError } from '../middleware/error';
import { viatorGet } from '../services/viatorClient';

// ============================================================================
// /api/reviews — Viator user reviews (legacy UserReview model).
// LEGACY v1 path — verify against Viator v2.
// ============================================================================

const router = Router();

// GET /api/reviews/getUserReviewOfAProductOrDestination?destId=&topX=&sortOrder=
router.get(
  '/getUserReviewOfAProductOrDestination',
  asyncHandler(async (req, res) => {
    const { destId, topX, sortOrder } = req.query;
    if (!destId || !topX) throw new HttpError(400, 'destId and topX are required');
    res.json(await viatorGet('/service/content/user/reviews', { destId, topX, sortOrder })); // LEGACY v1
  }),
);

export default router;
