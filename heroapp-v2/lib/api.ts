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
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── helpers ───────────────────────────────────────────────────
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('hero_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
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
  return request<ViatorDestination[]>(
    `/api/destinations${params ? `?${params}` : ''}`,
  );
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
  return request<ViatorCategory[]>('/api/experiences/categories');
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
