import axios, { AxiosInstance } from 'axios';
import { env, isProd } from '../config/env';

// ─────────────────────────────────────────────
// Viator Partner API v2 client
// Docs: https://docs.viator.com/partner-api/technical/
// Base: https://api.sandbox.viator.com/partner  (sandbox)
//       https://api.viator.com/partner          (production)
//
// Ported from the legacy heroapi, which mixed Viator v1 (`/service/...`) and
// newer partner endpoints and used the deprecated `request` library with a
// hardcoded API key. This client is a single axios instance keyed from env.
//
// Generic helpers `viatorGet` / `viatorPost` are exposed so route modules can
// call long-tail endpoints while keeping auth/headers/logging centralized.
// Endpoints marked "LEGACY v1" used Viator's older `/service/*` API in the old
// code — verify the exact v2 path against current Viator docs before go-live.
// ─────────────────────────────────────────────

const createViatorClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.VIATOR_API_URL,
    headers: {
      'exp-api-key': env.VIATOR_API_KEY,
      'Accept-Language': 'en-AU',
      Accept: 'application/json;version=2.0',
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (!isProd) {
        // eslint-disable-next-line no-console
        console.error(`[Viator] ERROR ${err.response?.status} ${err.response?.config?.url}:`, err.response?.data);
      }
      return Promise.reject(err);
    },
  );

  if (!isProd) {
    client.interceptors.request.use((config) => {
      // eslint-disable-next-line no-console
      console.log(`[Viator] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    });
  }

  return client;
};

export const viatorClient = createViatorClient();

const CURRENCY = env.VIATOR_CURRENCY;

// ─── Generic passthrough helpers ──────────────
export async function viatorGet<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await viatorClient.get(path, { params });
  return data as T;
}

export async function viatorPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const { data } = await viatorClient.post(path, body ?? {});
  return data as T;
}

// ─── Sort value mapper ────────────────────────
// Confirmed valid Viator /products/search sort values (v2 sandbox, tested 2026-06-23):
//   TRAVELER_RATING    ✅ — average review rating
//   PRICE              ✅ — price (ASCENDING = cheapest, DESCENDING = most expensive)
//   DEFAULT            ✅ — Viator featured/commercial ordering
//   ITINERARY_DURATION ✅ — tour duration in minutes
const SORT_MAP: Record<string, { sort: string; order: string }> = {
  TOP_RATED: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
  TOP_SELLERS: { sort: 'DEFAULT', order: 'DESCENDING' },
  PRICE_ASC: { sort: 'PRICE', order: 'ASCENDING' },
  PRICE_DESC: { sort: 'PRICE', order: 'DESCENDING' },
  NEWEST: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
  DURATION: { sort: 'ITINERARY_DURATION', order: 'ASCENDING' },
};

// Viator v2 requires filtering.destination on /products/search; fall back to Sydney.
const DEFAULT_DEST_ID = '357';

// ─── Freetext search ──────────────────────────
export const searchFreetext = async (query: string) => {
  const { data } = await viatorClient.post('/search/freetext', {
    searchTerm: query,
    searchTypes: [{ searchType: 'DESTINATIONS', pagination: { start: 1, count: 10 } }],
    currency: CURRENCY,
  });
  return data;
};

/** Raw freetext passthrough (caller supplies the full body). */
export const freetextSearch = (body: unknown) => viatorPost('/search/freetext', body);

// ─── Destinations ─────────────────────────────
export const getDestinations = async (destId?: number) => {
  const params = destId ? { destId } : {};
  const { data } = await viatorClient.get('/destinations', { params });
  return data;
};

// ─── Tags / Categories ────────────────────────
export const getCategories = async () => {
  const { data } = await viatorClient.get('/products/tags');
  return data;
};
export const getProductTags = getCategories;

// ─── Response normalization ───────────────────
// Viator v2 nests rating/review data under `reviews` and price under
// `pricing.summary`, but heroapp-v2's ViatorProduct type (lib/types.ts) and
// every card component read a flat `rating`, `reviewCount`, and
// `price: { fromPrice, currencyCode }`. Passing the raw Viator shape straight
// through (as searchProducts/getProductDetail previously did) left
// `product.price` and `product.rating` undefined on every card. Confirmed
// against the working legacy Angular app, which reads
// `data.reviews.combinedAverageRating`, `data.reviews.totalReviews`,
// `data.pricing.currency`, and `data.pricing.summary.fromPrice`.
function normalizeViatorProduct<T extends Record<string, unknown>>(raw: T): T {
  const reviews = raw.reviews as { combinedAverageRating?: number; totalReviews?: number } | undefined;
  const pricing = raw.pricing as { summary?: { fromPrice?: number }; currency?: string } | undefined;

  return {
    ...raw,
    rating: (raw.rating as number | undefined) ?? reviews?.combinedAverageRating,
    reviewCount: (raw.reviewCount as number | undefined) ?? reviews?.totalReviews,
    price:
      raw.price ??
      (pricing?.summary?.fromPrice !== undefined
        ? { fromPrice: pricing.summary.fromPrice, currencyCode: pricing.currency ?? CURRENCY }
        : undefined),
  };
}

function normalizeViatorProducts<T extends Record<string, unknown>>(products: T[]): T[] {
  return products.map(normalizeViatorProduct);
}

// ─── Product search (typed, tested) ───────────
export const searchProducts = async (params: {
  destId?: number;
  catId?: number;
  subCatId?: number;
  searchTerm?: string;
  lowestPrice?: number;
  highestPrice?: number;
  startDate?: string;
  endDate?: string;
  sortOrder?: string;
  page?: number;
  perPage?: number;
}) => {
  const { page = 1, perPage = 20, ...rest } = params;
  const { sort, order } = SORT_MAP[rest.sortOrder ?? ''] ?? { sort: 'TRAVELER_RATING', order: 'DESCENDING' };

  // Keyword search with no explicit destination — /products/search has no
  // `searchTerm` filter (it was previously stuffed into `filtering`, where
  // Viator silently ignores it), so every keyword query fell through to the
  // hardcoded DEFAULT_DEST_ID and returned identical results regardless of
  // the query text. Real keyword search only exists via /search/freetext.
  if (rest.searchTerm && !rest.destId) {
    const { data } = await viatorClient.post('/search/freetext', {
      searchTerm: rest.searchTerm,
      searchTypes: [
        {
          searchType: 'PRODUCTS',
          pagination: { start: (page - 1) * perPage + 1, count: perPage },
        },
      ],
      currency: CURRENCY,
    });

    // /search/freetext nests results under products.results + products.totalCount,
    // unlike /products/search which returns { products: [...], totalCount }.
    // Normalize both shapes so callers (e.g. /api/experiences) get a
    // consistent { products, totalCount } response either way.
    const productsField = (data as { products?: unknown })?.products;
    if (Array.isArray(productsField)) {
      return {
        products: normalizeViatorProducts(productsField as Record<string, unknown>[]),
        totalCount: productsField.length,
      };
    }
    const nested = productsField as { results?: unknown[]; totalCount?: number } | undefined;
    const results = nested?.results ?? [];
    return {
      products: normalizeViatorProducts(results as Record<string, unknown>[]),
      totalCount: nested?.totalCount ?? results.length,
    };
  }

  const destination = rest.destId ? String(rest.destId) : DEFAULT_DEST_ID;

  const { data } = await viatorClient.post('/products/search', {
    filtering: {
      destination,
      tags: rest.catId ? [rest.catId] : undefined,
      lowestPrice: rest.lowestPrice,
      highestPrice: rest.highestPrice,
      startDate: rest.startDate,
      endDate: rest.endDate,
    },
    sorting: { sort, order },
    pagination: { start: (page - 1) * perPage + 1, count: perPage },
    currency: CURRENCY,
  });
  const products = (data as { products?: unknown })?.products;
  if (Array.isArray(products)) {
    return { ...data, products: normalizeViatorProducts(products as Record<string, unknown>[]) };
  }
  return data;
};

/** Raw /products/search passthrough (caller supplies filtering/sorting/pagination). */
export const searchProductsRaw = (body: unknown) => viatorPost('/products/search', body);

/** Look up products by their product codes. */
export const searchProductsByCodes = (body: unknown) => viatorPost('/products/search/codes', body);

// ─── Product detail / availability ────────────
export const getProductDetail = async (productCode: string) => {
  const { data } = await viatorClient.get(`/products/${productCode}`);
  return normalizeViatorProduct(data as Record<string, unknown>);
};

export const getProductAvailability = async (productCode: string, month?: string) => {
  const params: Record<string, string> = {};
  if (month) params.month = month;
  const { data } = await viatorClient.get(`/availability/schedules/${productCode}`, { params });
  return data;
};

export const getAvailabilitySchedulesBulk = (body: unknown) => viatorPost('/availability/schedules/bulk', body);
export const checkAvailability = (body: unknown) => viatorPost('/availability/check', body);

// ─── Reviews / content ────────────────────────
export const getProductReviews = (body: unknown) => viatorPost('/reviews/product', body);
export const getLocationsBulk = (body: unknown) => viatorPost('/locations/bulk', body);

// ─── Booking flow ─────────────────────────────
export const getBookingQuestions = () => viatorGet('/products/booking-questions');
export const getCancelReasons = () => viatorGet('/bookings/cancel-reasons');
export const getCancelQuote = (bookingRef: string) => viatorGet(`/bookings/${bookingRef}/cancel-quote`);
export const cancelBooking = (bookingRef: string, body: unknown) =>
  viatorPost(`/bookings/${bookingRef}/cancel`, body);
export const bookingHold = (body: unknown) => viatorPost('/bookings/hold', body);
export const bookProduct = (body: unknown) => viatorPost('/bookings/book', body);

/**
 * Enrich a stored booking with live Viator data (legacy per-row `/service/booking/mybookings`).
 * LEGACY v1 path — verify the v2 equivalent before go-live.
 */
export const getMyBookingFromViator = (email: string, itineraryOrItemId: string) =>
  viatorGet('/service/booking/mybookings', { email, itineraryOrItemId });

/**
 * Retrieve a voucher by key (legacy `/service/booking/voucher`).
 * LEGACY v1 path — verify the v2 equivalent before go-live.
 */
export const getVoucher = (voucherKey: string) => viatorGet('/service/booking/voucher', { voucherKey });
