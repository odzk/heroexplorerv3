import { Router, Request, Response } from 'express';
import {
  searchProducts,
  getProductDetail,
  getProductAvailability,
  getCategories,
} from '../services/viatorClient';

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
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const data = await getProductDetail(req.params.code);
    res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(502).json({ message: 'Failed to fetch experience detail', details: msg });
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
