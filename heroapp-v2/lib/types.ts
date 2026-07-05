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
  inclusions?: ViatorInclusionExclusion[];
  exclusions?: ViatorInclusionExclusion[];
  additionalInfo?: ViatorAdditionalInfo[];
  itinerary?: ViatorItinerary;
  // Populated server-side (heroapi-v2) by resolving every itinerary
  // location ref via Viator's /locations/bulk — see backend
  // src/lib/itineraryLocations.ts. Keyed by the raw `LOC-...` ref.
  resolvedLocations?: Record<string, { name?: string; address?: string }>;
}

// ── itinerary ("What to expect") ────────────────────────────────
// Polymorphic by itineraryType. Modeled on Viator's documented shapes
// (docs.viator.com/partner-api/technical/#section/Key-concepts/Itineraries).
// Kept loose ([key: string]: unknown) since not every field of every variant
// is exercised here — components must only read named fields, never spread
// a raw node into JSX (that's what caused the earlier "object with keys..."
// React error).
export interface ViatorLocationRef {
  location?: { ref?: string };
  attractionId?: number;
}

export interface ViatorItineraryDuration {
  fixedDurationInMinutes?: number;
  variableDurationFromMinutes?: number;
  variableDurationToMinutes?: number;
  description?: string;
}

export interface ViatorItineraryItem {
  pointOfInterestLocation?: ViatorLocationRef;
  duration?: ViatorItineraryDuration;
  passByWithoutStopping?: boolean;
  admissionIncluded?: 'YES' | 'NO' | 'NOT_APPLICABLE';
  description?: string;
  [key: string]: unknown;
}

export interface ViatorItineraryDay {
  title?: string;
  dayNumber?: number;
  items?: ViatorItineraryItem[];
  accommodations?: Array<{ description?: string }>;
  [key: string]: unknown;
}

export interface ViatorItineraryStop {
  stopLocation?: { ref?: string };
  description?: string;
}

export interface ViatorItineraryRoute {
  name?: string;
  operatingSchedule?: string;
  duration?: ViatorItineraryDuration;
  stops?: ViatorItineraryStop[];
  [key: string]: unknown;
}

export interface ViatorItinerary {
  itineraryType?: 'STANDARD' | 'ACTIVITY' | 'MULTI_DAY_TOUR' | 'HOP_ON_HOP_OFF' | 'UNSTRUCTURED' | string;
  skipTheLine?: boolean;
  privateTour?: boolean;
  maxTravelersInSharedTour?: number;
  duration?: ViatorItineraryDuration;
  unstructuredDescription?: string;
  unstructuredItinerary?: string;
  // STANDARD
  itineraryItems?: ViatorItineraryItem[];
  // ACTIVITY
  activityInfo?: { description?: string };
  foodMenus?: Array<{ course?: string; dishName?: string; dishDescription?: string }>;
  // MULTI_DAY_TOUR
  days?: ViatorItineraryDay[];
  // HOP_ON_HOP_OFF
  routes?: ViatorItineraryRoute[];
  [key: string]: unknown;
}

// ── reviews ──────────────────────────────────────────────────────
// Response shape for POST /reviews/product is not exhaustively confirmed
// against a live sandbox response, so this is kept intentionally loose.
// Render code must only read named string/number fields below — never
// render an unrecognized nested object directly.
export interface ViatorReviewPhoto {
  url?: string;
  caption?: string;
  [key: string]: unknown;
}

export interface ViatorReview {
  provider?: string;
  rating?: number;
  title?: string;
  text?: string;
  travelDate?: string;
  publishedDate?: string;
  authorName?: string;
  userAvatarUrl?: string;
  photos?: Array<ViatorReviewPhoto | string>;
  [key: string]: unknown;
}

export interface ViatorReviewsSummary {
  combinedAverageRating?: number;
  totalReviews?: number;
  reviewCountTotals?: Array<{ rating?: number; count?: number }>;
  [key: string]: unknown;
}

export interface ViatorReviewsResponse {
  reviews?: ViatorReview[];
  products?: ViatorReviewsSummary[];
  [key: string]: unknown;
}

// ── related experiences ────────────────────────────────────────
export interface RelatedExperiencesResponse {
  products: ViatorProduct[];
}

// Viator v2 "inclusions" / "exclusions" item — a structured description,
// not a plain string. otherDescription is a free-text override; when absent,
// fall back to typeDescription, then categoryDescription, then category.
export interface ViatorInclusionExclusion {
  otherDescription?: string;
  category?: string;
  categoryDescription?: string;
  type?: string;
  typeDescription?: string;
}

// Viator v2 "additionalInfo" item.
export interface ViatorAdditionalInfo {
  description?: string;
  type?: string;
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
