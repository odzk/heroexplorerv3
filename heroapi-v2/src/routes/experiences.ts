import { Router, Request, Response } from 'express';
import {
  searchProducts,
  getProductDetail,
  getProductAvailability,
  getCategories,
  getProductReviews,
  getLocationsBulk,
} from '../services/viatorClient';
import { collectLocationRefs, buildLocationMap } from '../lib/itineraryLocations';

const router = Router();

// GET /api/experiences?destId=4&catId=11&page=1&perPage=20&sort=TOP_SELLERS
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      destId, catId, subCatId, searchTerm,
      lowestPrice, highestPrice, startDate, endDate,
      sortOrder, page, perPage,
    } = req.query;

    const results = await searchProducts({
      destId: destId ? Number(destId) : undefined,
      catId: catId ? Number(catId) : undefined,
      subCatId: subCatId ? Number(subCatId) : undefined,
      searchTerm: searchTerm ? String(searchTerm) : undefined,
      lowestPrice: lowestPrice ? Number(lowestPrice) : undefined,
      highestPrice: highestPrice ? Number(highestPrice) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      sortOrder: sortOrder ? String(sortOrder) : 'TOP_SELLERS',
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : 20,
    });

    res.json(results);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to search experiences', details: msg });
  }
});

// GET /api/experiences/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const data = await getCategories();
    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to fetch categories', details: msg });
  }
});

// GET /api/experiences/:code
// Enriches the raw Viator product-detail response with `resolvedLocations`:
// a { ref -> { name, address } } map for every location referenced anywhere
// in `itinerary` (see src/lib/itineraryLocations.ts for why this is needed —
// Viator's itinerary items only carry an opaque location ref, not a name).
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const data = (await getProductDetail(req.params.code)) as Record<string, unknown>;

    const refs = Array.from(collectLocationRefs(data.itinerary));
    if (refs.length > 0) {
      try {
        const bulk = await getLocationsBulk({ locations: refs });
        data.resolvedLocations = buildLocationMap(bulk);
      } catch (locErr: unknown) {
        // Non-fatal: itinerary still renders using raw refs as a fallback label.
        const msg = locErr instanceof Error ? locErr.message : 'Unknown error';
        // eslint-disable-next-line no-console
        console.error(`[experiences] locations/bulk enrichment failed for ${req.params.code}:`, msg);
        data.resolvedLocations = {};
      }
    }

    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to fetch experience detail', details: msg });
  }
});

// GET /api/experiences/:code/reviews?page=1&perPage=10
// Raw-ish passthrough of Viator's POST /reviews/product, paginated. Response
// shape is defensively typed on the frontend (see lib/types.ts) since it is
// not exhaustively confirmed against a live sandbox response.
router.get('/:code/reviews', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.perPage ?? 10);
    const data = await getProductReviews({
      productCode: req.params.code,
      provider: 'ALL',
      pagination: { start: (page - 1) * perPage + 1, count: perPage },
    });
    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to fetch experience reviews', details: msg });
  }
});

// GET /api/experiences/:code/related?destId=4&catId=11&limit=8
// "Other related experiences" — Viator v2 has no dedicated similar-products
// endpoint, so this reuses /products/search scoped to the same destination
// (and category, if supplied) and filters out the current product.
router.get('/:code/related', async (req: Request, res: Response) => {
  try {
    const { destId, catId, limit } = req.query;
    if (!destId) {
      res.json({ products: [] });
      return;
    }

    const perPage = Math.min(Number(limit ?? 8) + 1, 24); // +1 to survive filtering out self
    const results = (await searchProducts({
      destId: Number(destId),
      catId: catId ? Number(catId) : undefined,
      sortOrder: 'TOP_RATED',
      page: 1,
      perPage,
    })) as { products?: Array<Record<string, unknown>>; totalCount?: number };

    const products = (results?.products ?? [])
      .filter((p) => p.productCode !== req.params.code)
      .slice(0, Number(limit ?? 8));

    res.json({ products });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to fetch related experiences', details: msg });
  }
});

// GET /api/experiences/:code/availability?month=2024-12
router.get('/:code/availability', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const data = await getProductAvailability(
      req.params.code,
      month ? String(month) : undefined,
    );
    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to fetch availability', details: msg });
  }
});

export default router;
