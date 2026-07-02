import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';

// ============================================================================
// /api/subcategories — Prisma CRUD (legacy exposed stock LoopBack CRUD here).
// Reads are public; writes are admin-gated.
// ============================================================================

const router = Router();

// GET /api/subcategories?categoryId=
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const where = categoryId !== undefined ? { categoryId } : {};
    res.json(await prisma.subcategory.findMany({ where, orderBy: { id: 'asc' } }));
  }),
);

// GET /api/subcategories/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, 'Invalid id');
    const row = await prisma.subcategory.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'Subcategory not found');
    res.json(row);
  }),
);

// POST /api/subcategories  (admin)
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { subcategoryId, subcategoryName, subcategoryUrlName, categoryId } = req.body ?? {};
    if (subcategoryId === undefined) throw new HttpError(400, 'subcategoryId is required');
    const row = await prisma.subcategory.create({
      data: {
        subcategoryId: Number(subcategoryId),
        subcategoryName: subcategoryName ?? null,
        subcategoryUrlName: subcategoryUrlName ?? null,
        categoryId: categoryId != null ? Number(categoryId) : null,
      },
    });
    res.status(201).json(row);
  }),
);

// PATCH /api/subcategories/:id  (admin)
router.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, 'Invalid id');
    res.json(await prisma.subcategory.update({ where: { id }, data: req.body ?? {} }));
  }),
);

// DELETE /api/subcategories/:id  (admin)
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, 'Invalid id');
    await prisma.subcategory.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
