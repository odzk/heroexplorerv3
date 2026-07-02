import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';

// ============================================================================
// /api/bookers — Booker tenant registry (subdomain -> id).
// ============================================================================

const router = Router();

// GET /api/bookers/getBookerId?subDomain=  — public tenant lookup
router.get(
  '/getBookerId',
  asyncHandler(async (req: Request, res: Response) => {
    const subDomain = String(req.query.subDomain ?? '');
    if (!subDomain) throw new HttpError(400, 'subDomain is required');
    const booker = await prisma.booker.findFirst({ where: { name: subDomain } });
    res.json(booker);
  }),
);

// GET /api/bookers  — list (admin)
router.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await prisma.booker.findMany({ orderBy: { id: 'asc' } }));
  }),
);

// POST /api/bookers  — create (admin)
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body ?? {};
    if (!name) throw new HttpError(400, 'name is required');
    res.status(201).json(await prisma.booker.create({ data: { name: String(name) } }));
  }),
);

// GET /api/bookers/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, 'Invalid id');
    const booker = await prisma.booker.findUnique({ where: { id } });
    if (!booker) throw new HttpError(404, 'Booker not found');
    res.json(booker);
  }),
);

export default router;
