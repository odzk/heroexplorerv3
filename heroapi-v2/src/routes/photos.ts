import { Router } from 'express';
import { asyncHandler, HttpError } from '../middleware/error';
import { viatorGet } from '../services/viatorClient';

// ============================================================================
// /api/photos — Viator user photos (legacy UserPhoto model).
// NOTE: this FETCHES Viator user photos; it does not upload. (Logo upload lives
// in /api/customizations/uploadFile.) LEGACY v1 path — verify against Viator v2.
// ============================================================================

const router = Router();

// GET /api/photos/getUserPhotosOfAProductOrDestination?destId=&topX=&sortOrder=
router.get(
  '/getUserPhotosOfAProductOrDestination',
  asyncHandler(async (req, res) => {
    const { destId, topX, sortOrder } = req.query;
    if (!destId || !topX) throw new HttpError(400, 'destId and topX are required');
    res.json(await viatorGet('/service/content/user/photos', { destId, topX, sortOrder })); // LEGACY v1
  }),
);

export default router;
