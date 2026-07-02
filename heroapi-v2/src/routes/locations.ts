import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { getLocationsBulk } from '../services/viatorClient';

// ============================================================================
// /api/locations — Viator locations/bulk passthrough (legacy Location model).
// ============================================================================

const router = Router();

// POST /api/locations/getAllLocation  body: { locations: ["LOC-..."] }
router.post('/getAllLocation', asyncHandler(async (req, res) => res.json(await getLocationsBulk(req.body))));

export default router;
