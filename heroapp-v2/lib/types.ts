// ─────────────────────────────────────────────────────────────
//  Hero Explorer v2 — Shared Frontend Types
// ─────────────────────────────────────────────────────────────

// Viator v2 image structure
export interface ViatorImageVariant {
  width: number;
  height: number;
  url: string;
}

export interface ViatorImage {
  imageSource?: string;
  caption?: string;
  isCover?: boolean;
  variants: ViatorImageVariant[];
}

export interface ViatorProduct {
  productCode: string;
  title: string;
  description?: string;
  shortDescription?: string;
  // v2 image array (preferred)
  images?: ViatorImage[];
  // v1 fallback fields (may not be present in v2 responses)
  thumbnailHiResURL?: string;
  thumbnailURL?: string;
  rating?: number;
  reviewCount?: number;
  price?: {
    fromPrice: number;
    currencyCode: string;
  };
  duration?: {
    fixedDurationInMinutes?: number;
    variableDurationFromMinutes?: number;
    variableDurationToMinutes?: number;
  };
  flags?: string[];
  publishedDate?: string;
  destinationName?: string;
  destinationId?: number;
  categories?: Array<{ id: number; name: string }>;
  photoCount?: number;
  itineraryType?: string;
  bookingConfirmationSettings?: {
    confirmationType: string;
  };
  inclusions?: string[];
  exclusions?: string[];
  additionalInfo?: string[];
}

export interface ViatorDestination {
  destinationId: number;
  destinationName: string;
  destinationType: string;
  parentDestinationId?: number;
  parentDestinationName?: string;
  lookupId?: string;
  latitude?: number;
  longitude?: number;
  iataCode?: string;
}

export interface ViatorCategory {
  id: number;
  name: string;
  parentId?: number;
}

export interface SearchParams {
  destId?: number;
  catId?: number;
  searchTerm?: string;
  lowestPrice?: number;
  highestPrice?: number;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'TOP_RATED' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST';
  page?: number;
  perPage?: number;
}

export interface ApiResponse<T> {
  data: T;
  totalCount?: number;
  page?: number;
  perPage?: number;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// ── bookings ──────────────────────────────────────────────────
export interface PaxMixEntry {
  ageBand: 'ADULT' | 'CHILD' | 'INFANT' | 'YOUTH' | 'SENIOR' | 'TRAVELER';
  numberOfTravelers: number;
}

export interface AvailabilityCheckBookableItem {
  productOptionCode: string;
  seasonId?: string;
  bookableItemId?: string;
  unavailableReasons?: string[];
  pricingDetails?: unknown;
  [key: string]: unknown;
}

export interface AvailabilityCheckResult {
  productCode?: string;
  bookableItems?: AvailabilityCheckBookableItem[];
  currency?: string;
  [key: string]: unknown;
}

export interface BookingCommunication {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface BookRequestPayload {
  productCode: string;
  productOptionCode?: string;
  travelDate: string;
  currency: string;
  paxMix: PaxMixEntry[];
  communication: BookingCommunication;
  bookingQuestionAnswers?: unknown[];
  partnerBookingRef: string;
  // legacy top-level fields the heroapi-v2 route also reads directly
  email: string;
  name?: string;
  productTitle?: string;
  chargedPrice?: number;
}

export interface BookingResult {
  status?: string;
  itineraryId?: string;
  bookingRef?: string;
  message?: string;
  data?: {
    totalPrice?: { price?: number };
    voucherKey?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface HeroBookingRecord {
  id: number;
  itineraryId: string;
  email: string;
  productCode: string;
  productTitle?: string | null;
  travelDate?: string | null;
  chargedPrice?: number | string | null;
  currency?: string | null;
  isCancel: number;
  voucherKey?: string | null;
  [key: string]: unknown;
}

export interface AvailabilitySchedule {
  productCode: string;
  bookableItems: Array<{
    productOptionCode: string;
    seasons: Array<{
      startDate: string;
      endDate: string;
      pricingRecords: Array<{
        daysOfWeek: string[];
        timedEntries: Array<{
          startTime: string;
          unavailableDates?: Array<{ date: string; reason: string }>;
        }>;
        pricingDetails: Array<{
          ageBand: string;
          price: number;
          currencyCode: string;
        }>;
      }>;
    }>;
  }>;
}
