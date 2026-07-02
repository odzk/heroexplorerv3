import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import { uploadBase64Image } from '../services/storageService';
import { createSubdomainCname } from '../services/dnsService';

// ============================================================================
// /api/customizations — per-tenant white-label branding (ported from legacy).
//   getSettingsByDomain / getSettingsById -> public (frontend theming)
//   getAllSubdomain                       -> admin list
//   saveSettingsByDomain                  -> upsert by subdomain (auth)
//   uploadFile                            -> logo -> S3 (auth)
//   addDomainAws -> addDomain             -> DigitalOcean CNAME (admin, irreversible)
// ============================================================================

const router = Router();

// GET /api/customizations/getSettingsByDomain?subdomain=  (public)
router.get(
  '/getSettingsByDomain',
  asyncHandler(async (req: Request, res: Response) => {
    const subdomain = String(req.query.subdomain ?? '');
    if (!subdomain) throw new HttpError(400, 'subdomain is required');
    res.json(await prisma.customization.findFirst({ where: { subdomain } }));
  }),
);

// GET /api/customizations/getSettingsById?id=  (public)
router.get(
  '/getSettingsById',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.query.id);
    if (!Number.isFinite(id)) throw new HttpError(400, 'Invalid id');
    res.json(await prisma.customization.findUnique({ where: { id } }));
  }),
);

// GET /api/customizations/getAllSubdomain?filter=  (admin)
router.get(
  '/getAllSubdomain',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query.filter ? String(req.query.filter) : undefined;
    const where = filter ? { subdomain: { contains: filter, mode: 'insensitive' as const } } : {};
    res.json(await prisma.customization.findMany({ where, orderBy: { id: 'asc' } }));
  }),
);

// PATCH /api/customizations/saveSettingsByDomain  (auth) — upsert by subdomain
router.patch(
  '/saveSettingsByDomain',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const d = req.body ?? {};
    if (!d.subdomain) throw new HttpError(400, 'subdomain is required');

    const data = {
      user_id: d.user_id ?? null,
      subdomain: d.subdomain,
      button_type: d.button_type ?? null,
      primary_color: d.primary_color ?? null,
      secondary_color: d.secondary_color ?? null,
      text_color: d.text_color ?? null,
      logo_url: d.logo_url ?? null,
      logo_width: d.logo_width ?? null,
      logo_height: d.logo_height ?? null,
    };

    const existing = await prisma.customization.findFirst({ where: { subdomain: d.subdomain } });
    const saved = existing
      ? await prisma.customization.update({ where: { id: existing.id }, data })
      : await prisma.customization.create({ data });
    res.json(saved);
  }),
);

// POST /api/customizations/uploadFile  (auth) — logo -> S3
// body: { image: "data:image/png;base64,....", imageFileName: "logo.png" }
router.post(
  '/uploadFile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { image, imageFileName } = req.body ?? {};
    if (!image || !imageFileName) throw new HttpError(400, 'image and imageFileName are required');
    const result = await uploadBase64Image({ data: String(image), fileName: String(imageFileName) });
    res.json(result);
  }),
);

// POST /api/customizations/addDomain?subdomain=  (admin) — provision subdomain CNAME
// ⚠️ IRREVERSIBLE external DNS mutation. Admin-only.
router.post(
  '/addDomain',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const subdomain = String(req.query.subdomain ?? req.body?.subdomain ?? '');
    if (!subdomain) throw new HttpError(400, 'subdomain is required');

    const existing = await prisma.customization.findFirst({ where: { subdomain } });
    if (existing) {
      res.json({ message: 'Subdomain already exists', customization: existing });
      return;
    }

    const record = await createSubdomainCname(subdomain);
    const customization = await prisma.customization.create({ data: { subdomain } });
    res.status(201).json({ message: 'Subdomain provisioned', dns: record, customization });
  }),
);

export default router;
