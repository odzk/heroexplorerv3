// ============================================================================
// Itinerary location-ref resolution.
//
// Viator's `itinerary` object (returned inline on GET /products/{code}) is
// polymorphic by `itineraryType` (STANDARD / ACTIVITY / MULTI_DAY_TOUR /
// HOP_ON_HOP_OFF / UNSTRUCTURED) and never includes a human-readable location
// name — only a `{ location: { ref: "LOC-..." } }` pointer. Per Viator docs
// (docs.viator.com/partner-api/technical/#section/Key-concepts/Itineraries),
// names/addresses must be resolved separately via POST /locations/bulk
// (confirmed request shape: `{ locations: ["LOC-..."] }` — see
// routes/locations.ts).
//
// Rather than hardcode a walker for every itineraryType's shape (STANDARD's
// `itineraryItems[]`, MULTI_DAY_TOUR's `days[].items[]`, HOP_ON_HOP_OFF's
// `routes[].stops[]`/`pointsOfInterest[]`, UNSTRUCTURED's
// `pointOfInterestLocations[]`, etc.), we walk the object generically and
// collect every `ref` found under a `location` key. This is resilient to
// itinerary-type-specific structure and any fields Viator adds later.
// ============================================================================

/** Recursively collect every `location.ref` string found anywhere in `value`. */
export function collectLocationRefs(value: unknown, refs: Set<string> = new Set()): Set<string> {
  if (value == null || typeof value !== 'object') return refs;

  if (Array.isArray(value)) {
    for (const item of value) collectLocationRefs(item, refs);
    return refs;
  }

  const obj = value as Record<string, unknown>;
  const loc = obj.location;
  if (loc && typeof loc === 'object' && typeof (loc as Record<string, unknown>).ref === 'string') {
    refs.add((loc as Record<string, unknown>).ref as string);
  }

  for (const key of Object.keys(obj)) {
    collectLocationRefs(obj[key], refs);
  }

  return refs;
}

export interface ResolvedLocation {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationsBulkAddress {
  street?: string;
  administrativeArea?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

/** Shape we defensively read from POST /locations/bulk — verify against live Viator response. */
interface LocationsBulkResponse {
  locations?: Array<{
    reference?: string;
    name?: string;
    address?: LocationsBulkAddress;
    center?: { latitude?: number; longitude?: number };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

function formatAddress(address?: LocationsBulkAddress): string | undefined {
  if (!address || typeof address !== 'object') return undefined;
  const parts = [address.street, address.administrativeArea, address.state, address.country].filter(
    (p): p is string => typeof p === 'string' && p.length > 0,
  );
  return parts.length > 0 ? parts.join(', ') : undefined;
}

/** Build a ref -> { name, address } lookup map from a /locations/bulk response. */
export function buildLocationMap(response: unknown): Record<string, ResolvedLocation> {
  const map: Record<string, ResolvedLocation> = {};
  const list = (response as LocationsBulkResponse)?.locations;
  if (!Array.isArray(list)) return map;

  for (const loc of list) {
    if (!loc || typeof loc.reference !== 'string') continue;
    map[loc.reference] = {
      name: typeof loc.name === 'string' ? loc.name : undefined,
      address: formatAddress(loc.address),
      latitude: loc.center?.latitude,
      longitude: loc.center?.longitude,
    };
  }
  return map;
}
