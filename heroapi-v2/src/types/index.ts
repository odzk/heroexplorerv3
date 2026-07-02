// ─────────────────────────────────────────────
// Hero Explorer API v2 — shared types
// ─────────────────────────────────────────────

// ── Auth ──────────────────────────────────────
export interface AuthPayload {
  userId: number;
  email: string;
  role?: number;
  iat?: number;
  exp?: number;
}

/** Public-safe user shape (never expose password / verification token). */
export interface PublicUser {
  id: number;
  email: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  mobile: string | null;
  profileurl: string | null;
  city: string | null;
  country: string | null;
  province: string | null;
  postcode: string | null;
  emailverified: number;
  isUpdateOffer: number;
  subdomain: string | null;
  role: number;
}

// ── Viator DTOs (passthrough responses are typed loosely) ──
export interface ViatorSearchRequest {
  searchTerm?: string;
  destId?: number;
  catId?: number;
  subCatId?: number;
  currencyCode?: string;
  lowestPrice?: number;
  highestPrice?: number;
  startDate?: string;
  endDate?: string;
  durationId?: number;
  sortOrder?: 'PRICE_ASC' | 'PRICE_DESC' | 'REVIEW_AVG_RATING_ASC' | 'REVIEW_AVG_RATING_DESC' | 'TOP_SELLERS';
  page?: number;
  perPage?: number;
}

export interface ViatorProduct {
  productCode: string;
  title: string;
  description?: string;
  thumbnailHiResURL?: string;
  thumbnailURL?: string;
  rating?: number;
  reviewCount?: number;
  price?: {
    fromPrice: number;
    currencyCode: string;
  };
  duration?: string;
  attractionLatitude?: number;
  attractionLongitude?: number;
  tags?: string[];
  flags?: string[];
}

export interface ViatorDestination {
  destinationId: number;
  destinationName: string;
  destinationType: string;
  parentId?: number;
  lookupId?: string;
  defaultCurrencyCode?: string;
  latitude?: number;
  longitude?: number;
  thumbnailURL?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

/** Standard paginated envelope used by list/report endpoints. */
export interface Paginated<T> {
  total: number;
  results: T[];
}
