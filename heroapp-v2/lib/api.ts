// ─────────────────────────────────────────────────────────────
//  Hero Explorer v2 — API Client
// ─────────────────────────────────────────────────────────────
import type {
  ViatorProduct,
  ViatorDestination,
  ViatorCategory,
  SearchParams,
  User,
  AvailabilitySchedule,
  AvailabilityCheckResult,
  BookRequestPayload,
  BookingResult,
  HeroBookingRecord,
  PaxMixEntry,
  ViatorReviewsResponse,
  RelatedExperiencesResponse,
} from './types';
import { logApiCall } from './debugLog';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── helpers ───────────────────────────────────────────────────
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('hero_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Every call through here now also feeds the dev debug console footer
// (components/debug/DebugConsole.tsx) via logApiCall — method, path, status,
// timing, and the response/error body. logApiCall itself is a no-op outside
// development, so this adds no overhead or data exposure in production.
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const startedAt = Date.now();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
  } catch (networkError) {
    logApiCall({
      method,
      path,
      status: 0,
      ok: false,
      durationMs: Date.now() - startedAt,
      error: networkError,
    });
    throw networkError;
  }

  const durationMs = Date.now() - startedAt;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    logApiCall({ method, path, status: res.status, ok: false, durationMs, body: err });
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  logApiCall({ method, path, status: res.status, ok: true, durationMs, body: data });
  return data;
}

// Near-static taxonomy (destinations, categories) is independently fetched
// on mount by more than one component per page — e.g. DestinationGrid +
// the search page both call getDestinations(), CategoryBar + SearchFilters
// both call getCategories(). With no dedupe, a single page load issued the
// same request twice, doubling the calls that hit the (now-cached, but
// still rate-limited) Viator-backed API routes. This dedupes concurrent
// calls to the same key and short-caches the result so back-to-back mounts
// within a few minutes reuse one response instead of refetching.
const dedupeCache = new Map<string, { promise: Promise<unknown>; expiresAt: number }>();

function requestDeduped<T>(key: string, fetcher: () => Promise<T>, ttlMs = 5 * 60 * 1000): Promise<T> {
  const cached = dedupeCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise as Promise<T>;
  }
  const promise = fetcher().catch((err) => {
    dedupeCache.delete(key); // never cache a failure
    throw err;
  });
  dedupeCache.set(key, { promise, expiresAt: Date.now() + ttlMs });
  return promise as Promise<T>;
}

// ── destinations ──────────────────────────────────────────────
export async function searchDestinations(
  q: string,
): Promise<ViatorDestination[]> {
  const params = new URLSearchParams({ q });
  return request<ViatorDestination[]>(`/api/destinations?${params}`);
}

export async function getDestinations(
  destId?: number,
): Promise<ViatorDestination[]> {
  const params = destId
    ? new URLSearchParams({ destId: String(destId) })
    : '';
  const path = `/api/destinations${params ? `?${params}` : ''}`;
  return requestDeduped(path, () => request<ViatorDestination[]>(path));
}

// ── experiences ───────────────────────────────────────────────
export async function searchExperiences(
  params: SearchParams,
): Promise<{ products: ViatorProduct[]; totalCount: number }> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  });
  return request<{ products: ViatorProduct[]; totalCount: number }>(
    `/api/experiences?${qs}`,
  );
}

export async function getCategories(): Promise<ViatorCategory[]> {
  return requestDeduped('/api/experiences/categories', () =>
    request<ViatorCategory[]>('/api/experiences/categories'),
  );
}

export async function getExperienceDetail(
  code: string,
): Promise<ViatorProduct> {
  return request<ViatorProduct>(`/api/experiences/${code}`);
}

export async function getExperienceAvailability(
  code: string,
  month?: string,
): Promise<AvailabilitySchedule> {
  const params = month ? `?month=${month}` : '';
  return request<AvailabilitySchedule>(
    `/api/experiences/${code}/availability${params}`,
  );
}

// Reviews are fetched client-side only (never SSR'd) — Viator's terms
// require review text to be excluded from indexable page source
// (docs.viator.com/partner-api/technical/#section/Key-concepts/Protecting-unique-content).
export async function getExperienceReviews(
  code: string,
  page = 1,
  perPage = 10,
): Promise<ViatorReviewsResponse> {
  const qs = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  return request<ViatorReviewsResponse>(`/api/experiences/${code}/reviews?${qs}`);
}

export async function getRelatedExperiences(
  code: string,
  params: { destId?: number; catId?: number; limit?: number },
): Promise<RelatedExperiencesResponse> {
  const qs = new URLSearchParams();
  if (params.destId != null) qs.set('destId', String(params.destId));
  if (params.catId != null) qs.set('catId', String(params.catId));
  if (params.limit != null) qs.set('limit', String(params.limit));
  return request<RelatedExperiencesResponse>(`/api/experiences/${code}/related?${qs}`);
}

// ── auth ──────────────────────────────────────────────────────
export async function register(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ token: string; user: User }> {
  return request<{ token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  return request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<User> {
  return request<User>('/api/auth/me');
}

// ── booking flow ─────────────────────────────────────────────
// Wired to heroapi-v2's /api/products booking routes (Viator passthroughs).
// No card capture on the frontend yet — bookExperience calls Viator's
// book endpoint directly; makeApayment (Stripe) is intentionally not wired
// here (see AskUserQuestion decision: "skip real card capture").

export async function checkProductAvailability(payload: {
  productCode: string;
  travelDate: string;
  currency: string;
  paxMix: PaxMixEntry[];
}): Promise<AvailabilityCheckResult> {
  return request<AvailabilityCheckResult>('/api/products/loadOptionsOfAProduct', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function holdBooking(
  payload: Partial<BookRequestPayload>,
): Promise<BookingResult> {
  return request<BookingResult>('/api/products/bookAProductHold', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function bookExperience(
  payload: BookRequestPayload,
): Promise<BookingResult> {
  return request<BookingResult>('/api/products/bookAProduct', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── booking history (requires auth) ──────────────────────────
export async function getMyBookings(email?: string): Promise<HeroBookingRecord[]> {
  const qs = email ? `?${new URLSearchParams({ email })}` : '';
  return request<HeroBookingRecord[]>(`/api/bookings/getListMyBooking${qs}`);
}

export async function getMyPastBookings(email?: string): Promise<HeroBookingRecord[]> {
  const qs = email ? `?${new URLSearchParams({ email })}` : '';
  return request<HeroBookingRecord[]>(`/api/bookings/listPastBooking${qs}`);
}

export async function cancelHeroBooking(
  itineraryId: string,
): Promise<{ message: string; updated: number }> {
  const qs = new URLSearchParams({ bookingId: itineraryId });
  return request<{ message: string; updated: number }>(
    `/api/bookings/cancelBookingDB?${qs}`,
  );
}
