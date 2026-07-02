import { Router, Request, Response } from 'express';
import { HeroBooking } from '@prisma/client';
import prisma from '../config/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import {
  getCancelReasons,
  getVoucher,
  cancelBooking as viatorCancel,
  getMyBookingFromViator,
} from '../services/viatorClient';
import { sendMail, isEmailEnabled, requestEditHtml } from '../services/emailService';

// ============================================================================
// /api/bookings — HeroBooking (ported from legacy LoopBack).
// Raw SQL (SQL-injection-prone) replaced with parameterized Prisma queries.
// Admin/tenant/user scoping added (legacy had open $everyone ACLs).
// The legacy no-op `cancelABooking` is reimplemented for real.
// ============================================================================

const router = Router();

const num = (v: unknown, def: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/** Best-effort enrichment of stored bookings with live Viator data. */
async function enrichWithViator(rows: HeroBooking[]): Promise<unknown[]> {
  return Promise.all(
    rows.map(async (row) => {
      let viator: unknown = null;
      try {
        viator = await getMyBookingFromViator(row.email, row.itineraryId);
      } catch {
        /* Viator unavailable — return DB row only */
      }
      return { ...row, viator };
    }),
  );
}

// ── Admin: all upcoming bookings ──────────────
// GET /api/bookings/getListAllBookingAdmin?offset=&limit=
router.get(
  '/getListAllBookingAdmin',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const offset = num(req.query.offset, 0);
    const limit = num(req.query.limit, 20);
    const where = { travelDate: { gte: new Date() }, isCancel: 0 };
    const [grouped, results] = await Promise.all([
      prisma.heroBooking.groupBy({ by: ['itineraryId'], where }),
      prisma.heroBooking.findMany({ where, distinct: ['itineraryId'], orderBy: { id: 'desc' }, skip: offset, take: limit }),
    ]);
    res.json({ total: grouped.length, results });
  }),
);

// ── Admin: all past / cancelled bookings ──────
router.get(
  '/getListAllPrevBookingAdmin',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const offset = num(req.query.offset, 0);
    const limit = num(req.query.limit, 20);
    const where = { OR: [{ travelDate: { lt: new Date() } }, { isCancel: 1 }] };
    const [grouped, results] = await Promise.all([
      prisma.heroBooking.groupBy({ by: ['itineraryId'], where }),
      prisma.heroBooking.findMany({ where, distinct: ['itineraryId'], orderBy: { id: 'desc' }, skip: offset, take: limit }),
    ]);
    res.json({ total: grouped.length, results });
  }),
);

// ── Tenant: upcoming bookings for a subdomain ─
router.get(
  '/getListAllBooking',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const subdomain = String(req.query.subdomain ?? '');
    if (!subdomain) throw new HttpError(400, 'subdomain is required');
    const offset = num(req.query.offset, 0);
    const limit = num(req.query.limit, 20);
    const where = { bookingSource: subdomain, travelDate: { gte: new Date() }, isCancel: 0 };
    const [grouped, rows] = await Promise.all([
      prisma.heroBooking.groupBy({ by: ['itineraryId'], where }),
      prisma.heroBooking.findMany({ where, distinct: ['itineraryId'], orderBy: { id: 'desc' }, skip: offset, take: limit }),
    ]);
    res.json({ total: grouped.length, results: await enrichWithViator(rows) });
  }),
);

// ── Tenant: past bookings for a subdomain ─────
router.get(
  '/getListAllBookingPrev',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const subdomain = String(req.query.subdomain ?? '');
    if (!subdomain) throw new HttpError(400, 'subdomain is required');
    const offset = num(req.query.offset, 0);
    const limit = num(req.query.limit, 20);
    const where = { bookingSource: subdomain, OR: [{ isCancel: 1 }, { travelDate: { lt: new Date() } }] };
    const [grouped, rows] = await Promise.all([
      prisma.heroBooking.groupBy({ by: ['itineraryId'], where }),
      prisma.heroBooking.findMany({ where, distinct: ['itineraryId'], orderBy: { id: 'desc' }, skip: offset, take: limit }),
    ]);
    res.json({ total: grouped.length, results: await enrichWithViator(rows) });
  }),
);

/** Ensure the caller may access a given email's bookings (self or admin). */
function assertOwnerOrAdmin(req: Request, email: string): void {
  if (req.user!.role !== 1 && req.user!.email.toLowerCase() !== email.toLowerCase()) {
    throw new HttpError(403, 'Forbidden');
  }
}

// ── User: my upcoming bookings ────────────────
router.get(
  '/getListMyBooking',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.query.email ?? req.user!.email);
    assertOwnerOrAdmin(req, email);
    const offset = num(req.query.offset, 0);
    const limit = num(req.query.limit, 20);
    const where = { email, travelDate: { gte: new Date() }, isCancel: 0 };
    const results = await prisma.heroBooking.findMany({ where, orderBy: { id: 'desc' }, skip: offset, take: limit });
    res.json(results);
  }),
);

// ── User: my past bookings ────────────────────
router.get(
  '/listPastBooking',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.query.email ?? req.user!.email);
    assertOwnerOrAdmin(req, email);
    const offset = num(req.query.offset, 0);
    const limit = num(req.query.limit, 20);
    const where = { email, OR: [{ isCancel: 1 }, { travelDate: { lt: new Date() } }] };
    const results = await prisma.heroBooking.findMany({ where, orderBy: { id: 'desc' }, skip: offset, take: limit });
    res.json(results);
  }),
);

// ── Soft-cancel a booking in the DB ───────────
// GET /api/bookings/cancelBookingDB?bookingId=<itineraryId>
router.get(
  '/cancelBookingDB',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const itineraryId = String(req.query.bookingId ?? '');
    if (!itineraryId) throw new HttpError(400, 'bookingId is required');
    const existing = await prisma.heroBooking.findFirst({ where: { itineraryId } });
    if (!existing) throw new HttpError(404, 'Booking not found');
    assertOwnerOrAdmin(req, existing.email);
    const { count } = await prisma.heroBooking.updateMany({ where: { itineraryId }, data: { isCancel: 1 } });
    res.json({ message: 'Booking canceled successfully', updated: count });
  }),
);

// ── Cancellation reasons (Viator) — public ────
router.get(
  '/getCancelBookingReasons',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await getCancelReasons());
  }),
);

// ── Cancel a booking (Viator + DB) — real impl (legacy was a no-op) ──
// POST /api/bookings/cancelABooking  body: { itineraryId, cancelItems:[{itemId, cancelCode}] }
router.post(
  '/cancelABooking',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { itineraryId, cancelItems } = req.body ?? {};
    if (!itineraryId || !Array.isArray(cancelItems)) {
      throw new HttpError(400, 'itineraryId and cancelItems[] are required');
    }
    const booking = await prisma.heroBooking.findFirst({ where: { itineraryId } });
    if (!booking) throw new HttpError(404, 'Booking not found');
    assertOwnerOrAdmin(req, booking.email);

    const results = await Promise.all(
      cancelItems.map(async (item: { itemId: string; cancelCode?: string }) => {
        try {
          const data = await viatorCancel(item.itemId, { reasonCode: item.cancelCode });
          return { itemId: item.itemId, ok: true, data };
        } catch (e) {
          return { itemId: item.itemId, ok: false, error: e instanceof Error ? e.message : 'cancel failed' };
        }
      }),
    );

    await prisma.heroBooking.updateMany({ where: { itineraryId }, data: { isCancel: 1 } });
    res.json({ itineraryId, results });
  }),
);

// ── Voucher (Viator) ──────────────────────────
router.get(
  '/getVoucherData',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const voucherKey = String(req.query.voucherKey ?? '');
    if (!voucherKey) throw new HttpError(400, 'voucherKey is required');
    res.json(await getVoucher(voucherKey));
  }),
);

// ── Request a booking change (email + flag) ───
// POST /api/bookings/requestEditBooking  body: { itineraryId, title, content }
const TITLE_FLAG_MAP: Record<string, keyof HeroBooking> = {
  'Cancel my booking': 'isRequestCancel',
  'Add or Remove travelers': 'isRequestEditTraveller',
  'Change tour option': 'isRequestChangeTour',
  'Change the date of my booking': 'isRequestChangeDate',
};
router.post(
  '/requestEditBooking',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { itineraryId, title, content } = req.body ?? {};
    if (!itineraryId || !title || !content) throw new HttpError(400, 'itineraryId, title and content are required');

    const booking = await prisma.heroBooking.findFirst({ where: { itineraryId } });
    if (!booking) throw new HttpError(404, 'Booking not found');
    assertOwnerOrAdmin(req, booking.email);

    const user = await prisma.heroUser.findUnique({ where: { email: booking.email } });

    if (isEmailEnabled()) {
      sendMail({
        to: 'hello@heroexplorer.com',
        subject: `Booking change request — ${title}`,
        html: requestEditHtml({
          firstname: user?.firstname,
          lastname: user?.lastname,
          email: booking.email,
          itineraryId,
          title,
          content,
        }),
      }).catch(() => undefined);
    }

    const flag = TITLE_FLAG_MAP[title] ?? 'isRequestChangeName';
    const updated = await prisma.heroBooking.updateMany({ where: { itineraryId }, data: { [flag]: 1 } });
    res.json({ message: 'Request submitted', flag, updated: updated.count });
  }),
);

// ── Reports (admin) ───────────────────────────
async function reportRows(startDate: string, endDate: string, offset?: number, limit?: number): Promise<{ total: number; rows: HeroBooking[] }> {
  const where = { travelDate: { gte: new Date(startDate), lte: new Date(endDate) } };
  const grouped = await prisma.heroBooking.groupBy({ by: ['itineraryId'], where });
  const rows = await prisma.heroBooking.findMany({
    where,
    distinct: ['itineraryId'],
    orderBy: { id: 'desc' },
    ...(offset !== undefined ? { skip: offset } : {}),
    ...(limit !== undefined ? { take: limit } : {}),
  });
  return { total: grouped.length, rows };
}

// GET /api/bookings/getReportBookings?startDate=&endDate=&offset=&limit=
router.get(
  '/getReportBookings',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) throw new HttpError(400, 'startDate and endDate are required');
    const { total, rows } = await reportRows(String(startDate), String(endDate), num(req.query.offset, 0), num(req.query.limit, 20));
    res.json({ total, results: await enrichWithViator(rows) });
  }),
);

// GET /api/bookings/downloadReportBookings?startDate=&endDate=&format=csv
router.get(
  '/downloadReportBookings',
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, format } = req.query;
    if (!startDate || !endDate) throw new HttpError(400, 'startDate and endDate are required');
    const { total, rows } = await reportRows(String(startDate), String(endDate));

    if (format === 'csv') {
      const cols = ['itineraryId', 'email', 'productCode', 'productTitle', 'travelDate', 'chargedPrice', 'currency', 'bookingSource', 'isCancel'];
      const header = cols.join(',');
      const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const body = rows.map((r) => cols.map((c) => escape((r as unknown as Record<string, unknown>)[c])).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="booking-report.csv"');
      res.send(`${header}\n${body}`);
      return;
    }

    res.json({ total, results: await enrichWithViator(rows) });
  }),
);

export default router;
