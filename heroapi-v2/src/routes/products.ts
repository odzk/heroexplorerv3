import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { optionalAuthenticate } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import {
  viatorGet,
  viatorPost,
  searchProductsRaw,
  freetextSearch,
  searchProductsByCodes,
  getProductDetail,
  getProductAvailability,
  getLocationsBulk,
  getProductReviews,
  getAvailabilitySchedulesBulk,
  getProductTags,
  getBookingQuestions,
  getCancelReasons,
  getCancelQuote,
  checkAvailability,
  cancelBooking,
  bookingHold,
  bookProduct,
} from '../services/viatorClient';
import { chargeCard } from '../services/stripeService';
import { sendMail, isEmailEnabled, bookingConfirmationHtml } from '../services/emailService';

// ============================================================================
// /api/products — ported from the legacy LoopBack Product model (33 methods).
// Mostly Viator passthroughs. Notable ports:
//   * makeApayment  -> Stripe charge (env key; was a hardcoded live key)
//   * bookAProduct  -> Viator book + persist HeroBooking + confirmation email
//   * dropped: getProductStandardTermsAndConditions (defunct on Viator)
//   * deduped: loadPriceForAnOptionProduct (was defined twice)
// Endpoints hitting Viator `/service/*` or `/v1/*` are LEGACY v1 paths — verify
// against current Viator v2 docs (tracked in MIGRATION.md).
// ============================================================================

const router = Router();

// ── Search ────────────────────────────────────
router.post('/searchForProducts', asyncHandler(async (req, res) => res.json(await searchProductsRaw(req.body))));
router.post('/searchForProductsByTags', asyncHandler(async (req, res) => res.json(await searchProductsRaw(req.body))));
router.post('/searchForProductsByTextAndCodeHP', asyncHandler(async (req, res) => res.json(await searchProductsRaw(req.body))));
router.post('/searchForProductsByTextAndCodeSB', asyncHandler(async (req, res) => res.json(await freetextSearch(req.body))));
router.post('/searchForProductByText', asyncHandler(async (req, res) => res.json(await freetextSearch(req.body))));
router.post('/searchForProductsByCode', asyncHandler(async (req, res) => res.json(await searchProductsByCodes(req.body))));

// Branch: empty text => product search; else => freetext
router.post(
  '/searchForProductsByTextAndCode',
  asyncHandler(async (req: Request, res: Response) => {
    const body = { ...(req.body ?? {}) };
    if (body.text === '' || body.text === undefined) {
      delete body.text;
      delete body.searchTypes;
      res.json(await searchProductsRaw(body));
    } else {
      res.json(await freetextSearch(body));
    }
  }),
);

// ── Detail / availability ─────────────────────
router.get('/getProductsDetails', asyncHandler(async (req, res) => {
  const code = String(req.query.code ?? '');
  if (!code) throw new HttpError(400, 'code is required');
  res.json(await getProductDetail(code));
}));
router.get('/getProductsDetailsPrice', asyncHandler(async (req, res) => {
  const code = String(req.query.code ?? '');
  if (!code) throw new HttpError(400, 'code is required');
  res.json(await getProductAvailability(code));
}));
router.get('/getDateAvaliableOfAProduct', asyncHandler(async (req, res) => {
  const code = String(req.query.productCode ?? '');
  if (!code) throw new HttpError(400, 'productCode is required');
  res.json(await getProductAvailability(code));
}));
router.get('/loadAvailableDate', asyncHandler(async (req, res) => {
  const code = String(req.query.productCode ?? '');
  if (!code) throw new HttpError(400, 'productCode is required');
  res.json(await getProductAvailability(code));
}));
router.post('/availabilitySchedule', asyncHandler(async (req, res) => res.json(await getAvailabilitySchedulesBulk(req.body))));
router.post('/loadOptionsOfAProduct', asyncHandler(async (req, res) => res.json(await checkAvailability(req.body))));

// loadAvailableDateAndPrice — checkAvailability with a graceful fallback shape
router.post(
  '/loadAvailableDateAndPrice',
  asyncHandler(async (req: Request, res: Response) => {
    const data = (await checkAvailability(req.body)) as { data?: { dates?: unknown[] } };
    if (data?.data) {
      if (!Array.isArray(data.data.dates)) data.data.dates = [];
      res.json(data);
      return;
    }
    const { year, month } = req.body ?? {};
    res.json({ bookingMonth: `${year}-${month}`, pricingUnit: 'per person', dates: [] });
  }),
);

// ── Locations / tags / questions / reviews ────
router.post('/getProductsDetailsLocation', asyncHandler(async (req, res) => res.json(await getLocationsBulk(req.body))));
router.get('/getProductsTagsV2', asyncHandler(async (_req, res) => res.json(await getProductTags())));
router.get('/getBookingQuestions', asyncHandler(async (_req, res) => res.json(await getBookingQuestions())));
router.post('/postProductReviewsV2', asyncHandler(async (req, res) => res.json(await getProductReviews(req.body))));

router.get('/getProductReviews', asyncHandler(async (req, res) => {
  const { code, topX, sortOrder, showUnavailable } = req.query;
  res.json(await viatorGet('/service/product/reviews', { code, topX, sortOrder, showUnavailable })); // LEGACY v1
}));
router.get('/getProductUserPhotos', asyncHandler(async (req, res) => {
  const { code, topX, showUnavailable } = req.query;
  res.json(await viatorGet('/service/product/photos', { code, topX, showUnavailable })); // LEGACY v1
}));
router.get('/getHotelPickupOfProduct', asyncHandler(async (req, res) => {
  const code = String(req.query.code ?? '');
  res.json(await viatorGet('/service/booking/hotels', { productCode: code })); // LEGACY v1
}));

// ── Cancellation quote/flow ───────────────────
router.get('/getCancelReasons', asyncHandler(async (_req, res) => res.json(await getCancelReasons())));
router.get('/checkStatus', asyncHandler(async (req, res) => {
  const bookingRef = String(req.query.bookingRef ?? '');
  if (!bookingRef) throw new HttpError(400, 'bookingRef is required');
  res.json(await getCancelQuote(bookingRef));
}));
router.post('/cancelAProduct', asyncHandler(async (req, res) => {
  const { bookingReference, ...rest } = req.body ?? {};
  if (!bookingReference) throw new HttpError(400, 'bookingReference is required');
  res.json(await cancelBooking(String(bookingReference), rest));
}));

// ── Pricing (legacy v1 booking API) ───────────
router.post('/loadAvailableTourGrades', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/booking/availability/tourgrades/pricingmatrix', req.body)))); // LEGACY v1
router.post('/loadPriceForAnOptionProduct', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/booking/pricingmatrix', req.body)))); // LEGACY v1 (deduped)
router.post('/reclculateThePriceWithPromotionCode', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/booking/calculateprice', req.body)))); // LEGACY v1 (misspelling preserved)
// Correctly-spelled alias
router.post('/recalculatePriceWithPromotionCode', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/booking/calculateprice', req.body))));

// ── Search + client-side filter (destId/price/duration/text) ──
function durationToMinutes(duration?: string): number {
  if (!duration) return 0;
  const d = duration.toLowerCase();
  const days = /(\d+)\s*day/.exec(d);
  const hours = /(\d+)\s*hour/.exec(d);
  const mins = /(\d+)\s*min/.exec(d);
  return (days ? +days[1] * 24 * 60 : 0) + (hours ? +hours[1] * 60 : 0) + (mins ? +mins[1] : 0);
}

router.post(
  '/searchForProductsByDatePriceDurationAndCategory',
  asyncHandler(async (req: Request, res: Response) => {
    const body = { ...(req.body ?? {}) };
    const { minPrice, maxPrice, minDuration, maxDuration, text, destId } = body;

    if (Number(destId) > 0) {
      const result = (await searchProductsRaw(body)) as { products?: Array<Record<string, unknown>> };
      let products = result?.products ?? [];
      products = products.filter((p) => {
        const price = Number(p.price ?? 0);
        const dur = durationToMinutes(p.duration as string | undefined);
        if (minPrice != null && price < Number(minPrice)) return false;
        if (maxPrice != null && price > Number(maxPrice)) return false;
        if (minDuration != null && dur < Number(minDuration)) return false;
        if (maxDuration != null && dur > Number(maxDuration)) return false;
        if (text && !String(p.title ?? '').toLowerCase().includes(String(text).toLowerCase())) return false;
        return true;
      });
      res.json({ ...result, products });
    } else {
      const fb = { ...body };
      delete fb.minPrice;
      delete fb.maxPrice;
      delete fb.minDuration;
      delete fb.maxDuration;
      fb.searchTypes = ['PRODUCT', 'DESTINATION'];
      res.json(await freetextSearch(fb));
    }
  }),
);
router.post('/searchForProductsAvaliableByCodeAndDate', asyncHandler(async (req, res) =>
  res.json(await viatorPost('/service/booking/availability', req.body)))); // LEGACY v1

// ── Booking hold ──────────────────────────────
router.post('/bookAProductHold', asyncHandler(async (req, res) => res.json(await bookingHold(req.body))));

// ── Payment (Stripe) ──────────────────────────
// POST /api/products/makeApayment  body: { token, amount, currency, bookingReference[], primaryTraveler, ... }
router.post(
  '/makeApayment',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { token, amount, currency, bookingReference, primaryTraveler, phoneTraveler } = req.body ?? {};
    if (!token || amount == null || !currency) throw new HttpError(400, 'token, amount and currency are required');

    const refs = Array.isArray(bookingReference) ? bookingReference.join(', ') : bookingReference ?? '';
    const charge = await chargeCard({
      token: String(token),
      amount: Number(amount),
      currency: String(currency),
      description: `Hero Explorer booking ${refs} — ${primaryTraveler ?? ''} ${phoneTraveler ?? ''}`.trim(),
    });
    res.json(charge);
  }),
);

// ── Book a product (Viator + persist + email) ─
router.post(
  '/bookAProduct',
  optionalAuthenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = { ...(req.body ?? {}) };
    const stripeToken = body.stripeToken ?? '';
    const bookerHomeCity = body.bookerhomeCity ?? body.homeCity ?? null;
    const bookingSource = body.bookingSource ?? null;
    // strip internal-only fields before forwarding to Viator
    delete body.bookerId;
    delete body.stripeToken;
    delete body.bookerhomeCity;
    delete body.bookingSource;

    const rev = (await bookProduct(body)) as {
      status?: string;
      itineraryId?: string;
      bookingRef?: string;
      data?: { totalPrice?: { price?: number }; voucherKey?: string };
    };

    if (rev?.status !== 'CONFIRMED') {
      res.json(rev);
      return;
    }

    const itineraryId = String(rev.itineraryId ?? rev.bookingRef ?? `IT-${Date.now()}`);
    const email = String(body.email ?? body.bookerEmail ?? '');
    const price = rev.data?.totalPrice?.price ?? body.chargedPrice ?? null;

    const booking = await prisma.heroBooking.create({
      data: {
        itineraryId,
        email,
        productCode: String(body.productCode ?? ''),
        stripeCode: String(stripeToken),
        travelDate: body.travelDate ? new Date(body.travelDate) : null,
        name: body.name ?? body.primaryTraveler ?? null,
        homeCity: bookerHomeCity,
        chargedPrice: price != null ? Number(price) : null,
        retailPrice: price != null ? Number(price) : null,
        merchantPrice: price != null ? Number(price) : null,
        tourGradeCode: body.tourGradeCode ?? null,
        currency: body.currency ?? null,
        productTitle: body.productTitle ?? null,
        distributorItemRef: body.distributorItemRef ?? null,
        bookerId: req.body?.bookerId ?? 0,
        bookingSource,
        voucherKey: rev.data?.voucherKey ?? null,
      },
    });

    if (email && isEmailEnabled()) {
      sendMail({
        to: email,
        subject: 'Your Hero Explorer booking is confirmed',
        html: bookingConfirmationHtml(booking),
      }).catch(() => undefined);
    }

    res.json(rev);
  }),
);

export default router;
