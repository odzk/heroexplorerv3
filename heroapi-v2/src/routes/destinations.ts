import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import { cacheGet, cacheSet } from '../config/redis';
import { searchFreetext, getDestinations, freetextSearch } from '../services/viatorClient';

// ============================================================================
// /api/destinations — Viator taxonomy + the DB-backed slice.
// Legacy raw SQL (`isTop`, LIKE search, bulk INSERT) is reimplemented with
// parameterized Prisma. Obsolete JSONP variants are intentionally dropped
// (see MIGRATION.md). Self-referential HTTP calls replaced with direct DB reads.
// ============================================================================

const router = Router();

// GET /api/destinations            — full taxonomy (Viator, cached)
// GET /api/destinations?q=sydney   — freetext destination search (Viator, not cached)
//
// The plain taxonomy branch is what the frontend actually calls (see
// heroapp-v2/lib/api.ts getDestinations()), from multiple components on the
// same page (DestinationGrid + the search page), with zero caching — every
// mount hit Viator live. That's the main contributor to the sandbox 429s seen
// on this route. Cache it the same way /getAllDestinations already does.
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { q, destId } = req.query;
    if (q) {
      res.json(await searchFreetext(String(q)));
      return;
    }

    const cacheKey = `viator:destinations:${destId ?? 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const data = await getDestinations(destId ? Number(destId) : undefined);
    await cacheSet(cacheKey, data, 86400);
    res.json(data);
  }),
);

// GET /api/destinations/getAllDestinations  — Viator taxonomy, Redis-cached
router.get(
  '/getAllDestinations',
  asyncHandler(async (_req: Request, res: Response) => {
    const cached = await cacheGet('viator:destinations');
    if (cached) {
      res.json(cached);
      return;
    }
    const data = await getDestinations();
    await cacheSet('viator:destinations', data, 86400);
    res.json(data);
  }),
);

// GET /api/destinations/getAllDestinationsAndUpdate  (admin) — seed/refresh DB from Viator
router.get(
  '/getAllDestinationsAndUpdate',
  requireAdmin,
  asyncHandler(async (_req: Request, res: Response) => {
    const data = (await getDestinations()) as { destinations?: Array<Record<string, unknown>> };
    const list = data?.destinations ?? [];
    let upserts = 0;

    for (const d of list) {
      const destinationId = Number(d.destinationId);
      if (!Number.isFinite(destinationId)) continue;
      await prisma.destination.upsert({
        where: { destinationId },
        create: {
          destinationId,
          destinationName: (d.destinationName ?? d.name) as string | undefined,
          destinationType: d.destinationType as string | undefined,
          destinationUrlName: d.destinationUrlName as string | undefined,
          defaultCurrencyCode: d.defaultCurrencyCode as string | undefined,
          lookupId: d.lookupId as string | undefined,
          parentId: d.parentId != null ? Number(d.parentId) : null,
          timeZone: d.timeZone as string | undefined,
          iataCode: d.iataCode as string | undefined,
          selectable: d.selectable as boolean | undefined,
          latitude: d.latitude != null ? Number(d.latitude) : null,
          longitude: d.longitude != null ? Number(d.longitude) : null,
        },
        update: {
          destinationName: (d.destinationName ?? d.name) as string | undefined,
          parentId: d.parentId != null ? Number(d.parentId) : null,
        },
      });
      upserts += 1;
    }
    await cacheSet('viator:destinations', data, 86400);
    res.json({ message: 'Destinations synced', upserts });
  }),
);

// GET /api/destinations/getTopDestinations  — DB (WHERE isTop)
router.get(
  '/getTopDestinations',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await prisma.destination.findMany({ where: { isTop: true }, orderBy: { sortOrder: 'asc' } }));
  }),
);
// Alias of the above (legacy had a separate hardcoded /getTopDestination).
router.get(
  '/getTopDestination',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await prisma.destination.findMany({ where: { isTop: true }, orderBy: { sortOrder: 'asc' } }));
  }),
);

// GET /api/destinations/getAllDestinationsBaseOnCurrentCode?currentCode=AUD
router.get(
  '/getAllDestinationsBaseOnCurrentCode',
  asyncHandler(async (req: Request, res: Response) => {
    const currentCode = String(req.query.currentCode ?? '');
    const data = (await getDestinations()) as { destinations?: Array<{ defaultCurrencyCode?: string }> };
    const filtered = (data?.destinations ?? []).filter((d) => (d.defaultCurrencyCode ?? '').includes(currentCode));
    res.json(filtered);
  }),
);

// GET /api/destinations/getListCitiesAustralia  — DB (AU city parentIds)
router.get(
  '/getListCitiesAustralia',
  asyncHandler(async (_req: Request, res: Response) => {
    const AU_PARENT_IDS = [120, 121, 122, 123, 124, 125, 126, 819];
    res.json(await prisma.destination.findMany({ where: { parentId: { in: AU_PARENT_IDS } } }));
  }),
);

// GET /api/destinations/getListFatherOfADestination?destId=  — walk ancestor chain (DB)
router.get(
  '/getListFatherOfADestination',
  asyncHandler(async (req: Request, res: Response) => {
    const destId = Number(req.query.destId);
    if (!Number.isFinite(destId)) throw new HttpError(400, 'destId is required');

    const chain = [];
    let current = await prisma.destination.findFirst({ where: { destinationId: destId } });
    let guard = 0;
    while (current && guard < 10) {
      chain.push(current);
      if (current.parentId == null) break;
      current = await prisma.destination.findFirst({ where: { destinationId: current.parentId } });
      guard += 1;
    }
    res.json(chain);
  }),
);

// GET /api/destinations/getListRegionOfADestination?destId=  — direct children (DB)
router.get(
  '/getListRegionOfADestination',
  asyncHandler(async (req: Request, res: Response) => {
    const destId = Number(req.query.destId ?? req.query.text);
    if (!Number.isFinite(destId)) throw new HttpError(400, 'destId is required');
    res.json(await prisma.destination.findMany({ where: { parentId: destId } }));
  }),
);

// GET /api/destinations/preSearchTextDestinationAndProduct?text=  — DB + Viator
router.get(
  '/preSearchTextDestinationAndProduct',
  asyncHandler(async (req: Request, res: Response) => {
    const text = String(req.query.text ?? '');
    if (!text) throw new HttpError(400, 'text is required');

    const [destination, product] = await Promise.all([
      prisma.destination.findMany({
        where: { destinationName: { contains: text, mode: 'insensitive' } },
        take: 5,
      }),
      freetextSearch({ searchTerm: text, searchTypes: [{ searchType: 'PRODUCTS', pagination: { start: 1, count: 5 } }], currency: 'AUD' }).catch(() => null),
    ]);
    res.json({ destination, product });
  }),
);

// POST /api/destinations/getDestinationNearYouByCityAndRegion  body: { city, region }
router.post(
  '/getDestinationNearYouByCityAndRegion',
  asyncHandler(async (req: Request, res: Response) => {
    const { city, region } = req.body ?? {};
    const match = await prisma.destination.findFirst({
      where: {
        destinationName: { contains: String(city ?? region ?? ''), mode: 'insensitive' },
      },
    });
    res.json(match ?? { destinationId: 22 }); // legacy default fallback
  }),
);

export default router;
